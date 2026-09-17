import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, limit, startAfter, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Phone, Mail, Calendar as CalendarIcon, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatWhatsappLink } from "@/lib/whatsapp";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toDate, type FirestoreDateValue } from "@/lib/firestoreDates";
import { Skeleton } from "@/components/ui/skeleton";

type Appointment = {
    id: string;
    created_at: FirestoreDateValue;
    client_name: string;
    client_email: string;
    client_phone: string;
    appointment_date: FirestoreDateValue;
    status: "pending" | "approved" | "rejected" | "completed";
    notes: string;
};

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const lastDocument = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const { toast } = useToast();

    const fetchAppointments = useCallback(async (reset = true) => {
        setLoading(true);
        try {
            const baseQuery = reset || !lastDocument.current
                ? query(collection(db, "appointments"), orderBy("appointment_date", "asc"), limit(50))
                : query(collection(db, "appointments"), orderBy("appointment_date", "asc"), startAfter(lastDocument.current), limit(50));
            const q = baseQuery;
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Appointment);
            setAppointments((current) => reset ? data : [...current, ...data]);
            lastDocument.current = querySnapshot.docs.at(-1) ?? null;
            setHasMore(querySnapshot.size === 50);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Randevular yüklenirken bir hata oluştu.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void fetchAppointments(true);
    }, [fetchAppointments]);

    const updateStatus = async (id: string, status: Appointment["status"]) => {
        try {
            const appointmentRef = doc(db, "appointments", id);
            await updateDoc(appointmentRef, { status });

            // Optimistic update
            setAppointments((current) =>
                current.map((apt) => (apt.id === id ? { ...apt, status } : apt))
            );

            toast({
                title: "Başarılı",
                description: "Randevu durumu güncellendi.",
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Durum güncellenemedi.",
            });
        }
    };

    const handleApproveAndWhatsapp = async (appointment: Appointment) => {
        await updateStatus(appointment.id, "approved");
        const formattedDate = format(toDate(appointment.appointment_date), "d MMMM yyyy HH:mm", { locale: tr });
        const message = `Merhaba Sayın ${appointment.client_name},\n\n${formattedDate} tarihindeki randevu talebiniz incelenmiş ve ONAYLANMIŞTIR.\n\nSeans detayları veya sorularınız için bu hat üzerinden görüşebiliriz.`;
        const waLink = formatWhatsappLink(appointment.client_phone, message);
        window.open(waLink, "_blank");
    };

    const deleteAppointment = async (id: string, clientName: string) => {
        if (!window.confirm(`${clientName} adlı danışanın randevusunu silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "appointments", id));

            // Optimistic update
            setAppointments((current) => current.filter((apt) => apt.id !== id));

            toast({
                title: "Başarılı",
                description: "Randevu silindi.",
            });
        } catch (error) {
            console.error("Error deleting appointment:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Randevu silinemedi.",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Bekliyor</Badge>;
            case "approved":
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Onaylandı</Badge>;
            case "rejected":
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Reddedildi</Badge>;
            case "completed":
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Tamamlandı</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Randevular</h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Danışan</TableHead>
                            <TableHead>İletişim</TableHead>
                            <TableHead>Notlar</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && appointments.length === 0 ? (
                            [1, 2, 3, 4].map((i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    Randevu bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                    <TableCell>
                                        {format(toDate(appointment.appointment_date), "d MMMM yyyy HH:mm", { locale: tr })}
                                    </TableCell>
                                    <TableCell className="font-medium">{appointment.client_name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            <span>{appointment.client_email}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span>{appointment.client_phone}</span>
                                                {appointment.client_phone && (
                                                    <a
                                                        href={formatWhatsappLink(
                                                            appointment.client_phone,
                                                            `Merhaba Sayın ${appointment.client_name}, randevunuz hakkında sizinle iletişime geçiyorum.`
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors"
                                                        title="Danışana WhatsApp'tan Yaz"
                                                    >
                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={appointment.notes}>
                                        {appointment.notes}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {appointment.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 flex items-center gap-1"
                                                        onClick={() => handleApproveAndWhatsapp(appointment)}
                                                        title="Onayla ve Danışana WhatsApp'tan Onay Mesajı Aç"
                                                    >
                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">Onayla & WhatsApp</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => updateStatus(appointment.id, "approved")}
                                                        title="Sadece Onayla"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        <span className="sr-only">Onayla</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => updateStatus(appointment.id, "rejected")}
                                                        title="Reddet"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Reddet</span>
                                                    </Button>
                                                </>
                                            )}
                                            {appointment.status === "approved" && (
                                                <a
                                                    href={formatWhatsappLink(
                                                        appointment.client_phone,
                                                        `Merhaba Sayın ${appointment.client_name},\n\n${format(toDate(appointment.appointment_date), "d MMMM yyyy HH:mm", { locale: tr })} tarihindeki onaylı randevunuz ile ilgili bilgilendirme yapmak istiyorum.`
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                                                    title="Danışana WhatsApp'tan Yaz"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    <span>WhatsApp</span>
                                                </a>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => deleteAppointment(appointment.id, appointment.client_name)}
                                                title="Sil"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Sil</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="space-y-3 block md:hidden">
                {loading && appointments.length === 0 ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border rounded-xl bg-card space-y-3">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-48" />
                            <div className="flex gap-2 pt-2 border-t">
                                <Skeleton className="h-9 flex-1 rounded-md" />
                                <Skeleton className="h-9 flex-1 rounded-md" />
                            </div>
                        </div>
                    ))
                ) : appointments.length === 0 ? (
                    <div className="text-center py-10 border rounded-xl bg-card text-muted-foreground text-sm">
                        Randevu bulunamadı.
                    </div>
                ) : (
                    appointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="p-4 border rounded-xl bg-card shadow-sm space-y-3"
                        >
                            {/* Card Header: Date & Status */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                                    <span>
                                        {format(toDate(appointment.appointment_date), "d MMM yyyy HH:mm", { locale: tr })}
                                    </span>
                                </div>
                                <div>{getStatusBadge(appointment.status)}</div>
                            </div>

                            {/* Client Name */}
                            <div>
                                <h3 className="font-semibold text-base text-foreground">
                                    {appointment.client_name}
                                </h3>
                            </div>

                            {/* Contact Links */}
                            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-1">
                                {appointment.client_phone && (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`tel:${appointment.client_phone}`}
                                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                        >
                                            <Phone className="h-3.5 w-3.5 shrink-0" />
                                            <span>{appointment.client_phone}</span>
                                        </a>
                                        <a
                                            href={formatWhatsappLink(
                                                appointment.client_phone,
                                                `Merhaba Sayın ${appointment.client_name}, randevunuz hakkında sizinle iletişime geçiyorum.`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors"
                                            title="Danışana WhatsApp'tan Yaz"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                )}
                                {appointment.client_email && (
                                    <a
                                        href={`mailto:${appointment.client_email}`}
                                        className="inline-flex items-center gap-1.5 hover:underline break-all"
                                    >
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span>{appointment.client_email}</span>
                                    </a>
                                )}
                            </div>

                            {/* Notes */}
                            {appointment.notes && (
                                <div className="text-xs bg-muted/50 p-2.5 rounded-md text-muted-foreground break-words">
                                    <span className="font-medium text-foreground">Not: </span>
                                    {appointment.notes}
                                </div>
                            )}

                            {/* Card Actions */}
                            <div className="flex flex-col gap-2 pt-2 border-t">
                                {appointment.status === "pending" ? (
                                    <>
                                        <Button
                                            size="sm"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 flex items-center justify-center gap-1.5"
                                            onClick={() => handleApproveAndWhatsapp(appointment)}
                                            title="Onayla ve Danışana WhatsApp'tan Onay Mesajı Aç"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            Onayla & WhatsApp
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                                onClick={() => updateStatus(appointment.id, "approved")}
                                            >
                                                <Check className="h-4 w-4 mr-1.5" />
                                                Onayla
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                                onClick={() => updateStatus(appointment.id, "rejected")}
                                            >
                                                <X className="h-4 w-4 mr-1.5" />
                                                Reddet
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="px-2.5 text-muted-foreground hover:text-red-700 hover:bg-red-50"
                                                onClick={() => deleteAppointment(appointment.id, appointment.client_name)}
                                                title="Sil"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Sil</span>
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {appointment.status === "approved" && (
                                            <a
                                                href={formatWhatsappLink(
                                                    appointment.client_phone,
                                                    `Merhaba Sayın ${appointment.client_name},\n\n${format(toDate(appointment.appointment_date), "d MMMM yyyy HH:mm", { locale: tr })} tarihindeki onaylı randevunuz ile ilgili bilgilendirme yapmak istiyorum.`
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                                                title="Danışana WhatsApp'tan Yaz"
                                            >
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                <span>WhatsApp ile Yaz</span>
                                            </a>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className={`${appointment.status === "approved" ? "flex-1" : "w-full"} text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20`}
                                            onClick={() => deleteAppointment(appointment.id, appointment.client_name)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1.5" />
                                            Randevuyu Sil
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {hasMore && (
                <Button variant="outline" onClick={() => fetchAppointments(false)} disabled={loading} className="w-full">
                    {loading ? "Yükleniyor..." : "Daha Fazla Göster"}
                </Button>
            )}
        </div>
    );
}
