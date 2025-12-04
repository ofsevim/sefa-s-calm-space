import { useState } from "react";
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
import { collection, addDoc } from "firebase/firestore";
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

const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export function BookingForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ad Soyad</FormLabel>
                            <FormControl>
                                <Input placeholder="Adınız Soyadınız" {...field} />
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
                                <FormLabel>E-posta</FormLabel>
                                <FormControl>
                                    <Input placeholder="ornek@email.com" {...field} />
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
                                <FormLabel>Telefon</FormLabel>
                                <FormControl>
                                    <Input placeholder="0555 555 55 55" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Randevu Tarihi</FormLabel>
                                <div className="border rounded-md p-3">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                        locale={tr}
                                        className="rounded-md"
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
                                <FormLabel>Randevu Saati</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Saat seçiniz" />
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
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notlar (Opsiyonel)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Belirtmek istediğiniz özel bir durum var mı?"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
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
