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
import { Check, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toDate, type FirestoreDateValue } from "@/lib/firestoreDates";

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

            toast({
                title: "Başarılı",
                description: "Randevu durumu güncellendi.",
            });
            await fetchAppointments(true);
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Durum güncellenemedi.",
            });
        }
    };

    const deleteAppointment = async (id: string, clientName: string) => {
        if (!window.confirm(`${clientName} adlı danışanın randevusunu silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "appointments", id));
            toast({
                title: "Başarılı",
                description: "Randevu silindi.",
            });
            await fetchAppointments(true);
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
                <h2 className="text-3xl font-bold tracking-tight">Randevular</h2>
            </div>

            <div className="rounded-md border">
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    Yükleniyor...
                                </TableCell>
                            </TableRow>
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
                                            <span>{appointment.client_phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={appointment.notes}>
                                        {appointment.notes}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {appointment.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => updateStatus(appointment.id, "approved")}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        <span className="sr-only">Onayla</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => updateStatus(appointment.id, "rejected")}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Reddet</span>
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => deleteAppointment(appointment.id, appointment.client_name)}
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
            {hasMore && (
                <Button variant="outline" onClick={() => fetchAppointments(false)} disabled={loading} className="w-full">
                    {loading ? "Yükleniyor..." : "Daha Fazla Göster"}
                </Button>
            )}
        </div>
    );
}
