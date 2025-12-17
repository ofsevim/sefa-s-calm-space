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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { tr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    phone: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
    date: z.date({
        required_error: "Lütfen bir tarih seçiniz.",
    }),
    time: z.string({
        required_error: "Lütfen bir saat seçiniz.",
    }),
    notes: z.string().optional(),
});

// Helper function to generate time slots between start and end hours
const generateTimeSlots = (startHour: number, endHour: number): string[] => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
};

export function BookingForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            notes: "",
        },
    });

    // Load working hours and update time slots when date changes
    useEffect(() => {
        const loadWorkingHours = async () => {
            try {
                const docRef = doc(db, "settings", "workingHours");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().items) {
                    const workingHours = docSnap.data().items;

                    if (selectedDate) {
                        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                        const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
                        const selectedDayName = dayNames[dayOfWeek];

                        // Find working hours for selected day
                        let dayHours = workingHours.find((wh: any) => wh.day === selectedDayName);

                        // If not found, check for range (e.g., "Pazartesi - Cuma")
                        if (!dayHours) {
                            dayHours = workingHours.find((wh: any) => {
                                if (wh.day.includes('-')) {
                                    const [start, end] = wh.day.split('-').map((d: string) => d.trim());
                                    const startIdx = dayNames.indexOf(start);
                                    const endIdx = dayNames.indexOf(end);
                                    return dayOfWeek >= startIdx && dayOfWeek <= endIdx;
                                }
                                return false;
                            });
                        }

                        if (dayHours && dayHours.hours !== "Kapalı") {
                            // Parse hours (e.g., "09:00 - 19:00")
                            const [startTime, endTime] = dayHours.hours.split('-').map((t: string) => t.trim());
                            const startHour = parseInt(startTime.split(':')[0]);
                            const endHour = parseInt(endTime.split(':')[0]);

                            setTimeSlots(generateTimeSlots(startHour, endHour));
                        } else {
                            // Closed on this day
                            setTimeSlots([]);
                            toast({
                                variant: "destructive",
                                title: "Kapalı Gün",
                                description: "Seçtiğiniz gün çalışma saatleri dışındadır.",
                            });
                        }
                    }
                } else {
                    // Default working hours if not set
                    setTimeSlots(generateTimeSlots(9, 19));
                }
            } catch (error) {
                console.error("Error loading working hours:", error);
                setTimeSlots(generateTimeSlots(9, 19)); // Fallback to default
            }
        };

        if (selectedDate) {
            loadWorkingHours();
        }
    }, [selectedDate, toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            // Combine date and time
            const appointmentDate = new Date(values.date);
            const [hours, minutes] = values.time.split(':').map(Number);
            appointmentDate.setHours(hours, minutes);

            await addDoc(collection(db, "appointments"), {
                client_name: values.name,
                client_email: values.email,
                client_phone: values.phone,
                appointment_date: appointmentDate.toISOString(),
                notes: values.notes,
                status: "pending",
                created_at: new Date().toISOString(),
            });

            toast({
                title: "Randevu Talebi Alındı",
                description: "En kısa sürede size dönüş yapılacaktır.",
            });
            form.reset();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error submitting appointment:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-foreground">Ad Soyad</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Adınız Soyadınız"
                                    className="h-11 rounded-xl border-2 focus:border-primary transition-colors"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold text-foreground">E-posta</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ornek@email.com"
                                        type="email"
                                        className="h-11 rounded-xl border-2 focus:border-primary transition-colors"
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
                                <FormLabel className="text-sm font-semibold text-foreground">Telefon</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0555 555 55 55"
                                        type="tel"
                                        className="h-11 rounded-xl border-2 focus:border-primary transition-colors"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-sm font-semibold text-foreground mb-2">Randevu Tarihi</FormLabel>
                                <div className="border-2 rounded-2xl p-4 bg-gradient-to-br from-sage-light/20 to-transparent hover:border-primary/50 transition-colors">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            setSelectedDate(date);
                                        }}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                        locale={tr}
                                        className="rounded-xl"
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
                                <FormLabel className="text-sm font-semibold text-foreground">Randevu Saati</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 rounded-xl border-2 focus:border-primary transition-colors">
                                            <SelectValue placeholder="Saat seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                        {timeSlots.length > 0 ? (
                                            timeSlots.map((time) => (
                                                <SelectItem key={time} value={time} className="rounded-lg">
                                                    {time}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                Lütfen önce tarih seçiniz
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-foreground">Notlar (Opsiyonel)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Belirtmek istediğiniz özel bir durum var mı?"
                                    className="resize-none min-h-[100px] rounded-xl border-2 focus:border-primary transition-colors"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-sage hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
