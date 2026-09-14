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
import { Loader2, CheckCircle2 } from "lucide-react";
import {
    combineAppointmentDate,
    generateTimeSlots,
    getAppointmentDocumentId,
    type WorkingHour,
} from "@/lib/booking";
import { workingHours as defaultWorkingHours } from "@/data/content";

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
    const [submittedInfo, setSubmittedInfo] = useState<{
        name: string;
        phone: string;
        date: Date;
        time: string;
    } | null>(null);
    const { toast } = useToast();

    // Fetch working hours once on mount
    useEffect(() => {
        const fetchInitialSettings = async () => {
            try {
                const hoursRef = doc(db, "settings", "workingHours");
                const hoursSnap = await getDoc(hoursRef);

                const config = hoursSnap.exists() && Array.isArray(hoursSnap.data().items)
                    ? (hoursSnap.data().items as WorkingHour[])
                    : defaultWorkingHours;
                setWorkingHoursConfig(config);
            } catch {
                setWorkingHoursConfig(defaultWorkingHours);
            }
        };
        fetchInitialSettings();
    }, []);

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

    // Update time slots instantly from memory when date changes
    useEffect(() => {
        if (!selectedDate) {
            setTimeSlots([]);
            return;
        }

        const config = workingHoursConfig.length > 0 ? workingHoursConfig : defaultWorkingHours;
        const slots = generateTimeSlots(config, selectedDate);
        setTimeSlots(slots);
        if (slots.length === 0) {
            toast({ variant: "destructive", title: "Kapalı Gün", description: "Seçtiğiniz gün randevu alınamamaktadır." });
        }
    }, [selectedDate, workingHoursConfig, toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const appointmentDate = combineAppointmentDate(values.date, values.time);
            const config = workingHoursConfig.length > 0 ? workingHoursConfig : defaultWorkingHours;
            const validSlots = generateTimeSlots(config, values.date);
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

            setSubmittedInfo({
                name: values.name.trim(),
                phone: values.phone.trim(),
                date: appointmentDate,
                time: values.time,
            });

            toast({
                title: "Randevu Talebi Alındı",
                description: "Talebiniz incelenip onaylandıktan sonra sizinle iletişime geçilecektir.",
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

    if (submittedInfo) {
        return (
            <div className="text-center py-8 px-4 space-y-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl animate-in fade-in-50 duration-300">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Randevu Talebiniz Alındı!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Sayın <b>{submittedInfo.name}</b>, randevu talebiniz sisteme iletildi. Talebiniz uzmanımız tarafından incelenip onaylandıktan sonra sizinle iletişime geçilecektir.
                    </p>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {submittedInfo.date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })} - Saat: {submittedInfo.time}
                    </p>
                </div>
                <div className="p-3.5 bg-white/80 dark:bg-emerald-900/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-200 max-w-md mx-auto leading-relaxed text-center">
                    🌿 Randevu talebiniz incelendikten ve onaylandıktan sonra uzmanımız sizinle doğrudan WhatsApp veya telefon üzerinden iletişime geçecektir.
                </div>
                <div className="pt-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSubmittedInfo(null);
                            form.reset();
                        }}
                        className="text-sm"
                    >
                        Yeni Randevu Oluştur
                    </Button>
                </div>
            </div>
        );
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
                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                        month: "space-y-4 w-full",
                                        caption: "flex justify-center pt-1 relative items-center mb-2",
                                        caption_label: "text-sm font-medium text-foreground",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                                        nav_button_previous: "absolute left-1",
                                        nav_button_next: "absolute right-1",
                                        table: "w-full border-collapse space-y-1",
                                        head_row: "flex w-full justify-between mb-1",
                                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                                        row: "flex w-full mt-2 justify-between",
                                        cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                        day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-sage hover:text-white transition-colors aria-selected:opacity-100 flex items-center justify-center cursor-pointer",
                                        day_selected: "bg-sage text-white hover:bg-sage-dark hover:text-white focus:bg-sage focus:text-white font-medium",
                                        day_today: "border border-sage text-sage font-semibold",
                                        day_outside: "text-muted-foreground opacity-30",
                                        day_disabled: "text-muted-foreground opacity-20 hover:bg-transparent hover:text-muted-foreground cursor-not-allowed",
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
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Randevu Saati</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!selectedDate || timeSlots.length === 0}
                            >
                                <FormControl>
                                    <SelectTrigger className="h-11 rounded-lg">
                                        <SelectValue
                                            placeholder={
                                                !selectedDate
                                                    ? "Önce tarih seçiniz"
                                                    : timeSlots.length === 0
                                                        ? "Uygun saat bulunamadı"
                                                        : "Saat seçiniz"
                                            }
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
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
