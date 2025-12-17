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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-sm font-medium">Randevu Tarihi</FormLabel>
                                <div className="border rounded-lg p-3 bg-muted/30">
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
                                        locale={tr}
                                        className="w-full"
                                        classNames={{
                                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                            month: "space-y-4",
                                            caption: "flex justify-center pt-1 relative items-center",
                                            caption_label: "text-sm font-medium",
                                            nav: "space-x-1 flex items-center",
                                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                            table: "w-full border-collapse space-y-1",
                                            head_row: "flex",
                                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                            row: "flex w-full mt-2",
                                            cell: "h-9 w-9 text-center text-sm p-0 relative",
                                            day: "h-9 w-9 p-0 font-normal",
                                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </div>

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
