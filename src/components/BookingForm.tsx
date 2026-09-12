import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { tr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import {
    combineAppointmentDate,
    generateTimeSlots,
    getAppointmentDocumentId,
    type WorkingHour,
} from "@/lib/booking";

const formSchema = z.object({
    name: z.string().trim().min(2, "İsim en az 2 karakter olmalıdır.").max(100),
    email: z.string().trim().email("Geçerli bir e-posta adresi giriniz.").max(254),
    phone: z.string().trim().regex(/^[+\d][\d\s()-]{9,19}$/, "Geçerli bir telefon numarası giriniz."),
    date: z.date({
        required_error: "Lütfen bir tarih seçiniz.",
    }),
    time: z.string({
        required_error: "Lütfen bir saat seçiniz.",
    }),
    notes: z.string().trim().max(1000, "Not en fazla 1000 karakter olabilir.").optional(),
    consent: z.boolean().refine(Boolean, "Aydınlatma metnini kabul etmelisiniz."),
});

export function BookingForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [workingHoursConfig, setWorkingHoursConfig] = useState<WorkingHour[]>([]);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            notes: "",
            consent: false,
        },
    });

    // Load working hours and update time slots when date changes
    useEffect(() => {
        const loadWorkingHours = async () => {
            if (!selectedDate) return;

            try {
                const docRef = doc(db, "settings", "workingHours");
                const docSnap = await getDoc(docRef);

                const { workingHours } = await import("@/data/content");
                const config = docSnap.exists() && Array.isArray(docSnap.data().items)
                    ? docSnap.data().items as WorkingHour[]
                    : workingHours;
                setWorkingHoursConfig(config);
                const slots = generateTimeSlots(config, selectedDate);
                setTimeSlots(slots);
                if (slots.length === 0) {
                    toast({ variant: "destructive", title: "Kapalı Gün", description: "Seçtiğiniz gün randevu alınamamaktadır." });
                }
            } catch (error) {
                console.error("Error loading working hours:", error);
                setTimeSlots([]);
                toast({ variant: "destructive", title: "Saatler yüklenemedi", description: "Lütfen daha sonra tekrar deneyin." });
            }
        };

        loadWorkingHours();
    }, [selectedDate, toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const appointmentDate = combineAppointmentDate(values.date, values.time);
            const validSlots = generateTimeSlots(workingHoursConfig, values.date);
            if (!validSlots.includes(values.time) || appointmentDate <= new Date()) {
                throw new Error("Geçersiz veya geçmiş randevu saati");
            }

            const appointmentRef = doc(db, "appointments", getAppointmentDocumentId(appointmentDate));
            await setDoc(appointmentRef, {
                client_name: values.name.trim(),
                client_email: values.email.trim().toLocaleLowerCase("tr-TR"),
                client_phone: values.phone.trim(),
                appointment_date: Timestamp.fromDate(appointmentDate),
                notes: values.notes?.trim() ?? "",
                status: "pending",
                created_at: serverTimestamp(),
                consent_version: "2026-09-13",
            });

            toast({
                title: "Randevu Talebi Alındı",
                description: "En kısa sürede size dönüş yapılacaktır.",
            });
            form.reset();
            setSelectedDate(undefined);
            setTimeSlots([]);
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            console.error("Error submitting appointment:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Bu saat daha önce alınmış veya artık kullanılamıyor. Lütfen başka bir saat seçin.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Ad Soyad</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Adınız Soyadınız"
                                    className="h-11 rounded-lg"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">E-posta</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ornek@email.com"
                                        type="email"
                                        className="h-11 rounded-lg"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Telefon</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0555 555 55 55"
                                        type="tel"
                                        className="h-11 rounded-lg"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-medium">Randevu Tarihi</FormLabel>
                            <div className="border rounded-lg overflow-hidden">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                        field.onChange(date);
                                        setSelectedDate(date);
                                        form.setValue("time", "");
                                        setTimeSlots([]);
                                    }}
                                    disabled={(date) =>
                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    locale={tr}
                                    className="w-full p-3"
                                    classNames={{
                                        months: "flex w-full",
                                        month: "w-full space-y-3",
                                        caption: "flex justify-center pt-1 relative items-center mb-2",
                                        caption_label: "text-sm font-medium",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                        table: "w-full border-collapse",
                                        head_row: "flex w-full",
                                        head_cell: "text-muted-foreground w-full font-normal text-[0.8rem] flex-1",
                                        row: "flex w-full mt-1",
                                        cell: "flex-1 text-center text-sm p-0 relative",
                                        day: "h-9 w-full p-0 font-normal hover:bg-accent rounded-md",
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                        day_today: "bg-accent text-accent-foreground",
                                        day_outside: "text-muted-foreground opacity-50",
                                        day_disabled: "text-muted-foreground opacity-50",
                                        day_hidden: "invisible",
                                    }}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-medium">Randevu Saati</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate || timeSlots.length === 0}>
                                <FormControl>
                                    <SelectTrigger className="h-11 rounded-lg">
                                        <SelectValue placeholder="Saat seçiniz" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[200px]">
                                    {timeSlots.length > 0 ? (
                                        timeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-sm text-muted-foreground">
                                            Lütfen önce tarih seçiniz
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Notlar (Opsiyonel)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Belirtmek istediğiniz özel bir durum var mı?"
                                    className="resize-none min-h-[90px] rounded-lg"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                        <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border p-3">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                    <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="underline">KVKK Aydınlatma Metni</a> ve
                                    {" "}<a href="/gizlilik" target="_blank" rel="noopener noreferrer" className="underline">Gizlilik Politikası</a>'nı okudum.
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-gradient-sage hover:opacity-90 transition-opacity"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gönderiliyor...
                        </>
                    ) : (
                        "Randevu Oluştur"
                    )}
                </Button>
            </form>
        </Form>
    );
}
