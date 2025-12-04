import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
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
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Appointment = {
    id: string;
    created_at: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    appointment_date: string;
    status: "pending" | "approved" | "rejected" | "completed";
    notes: string;
};

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "appointments"), orderBy("appointment_date", "asc"));
            const querySnapshot = await getDocs(q);
            const data: Appointment[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Appointment);
            });
            setAppointments(data);
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
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const updateStatus = async (id: string, status: Appointment["status"]) => {
        try {
            const appointmentRef = doc(db, "appointments", id);
            await updateDoc(appointmentRef, { status });

            toast({
                title: "Başarılı",
                description: "Randevu durumu güncellendi.",
            });
            fetchAppointments();
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Durum güncellenemedi.",
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
                                        {format(new Date(appointment.appointment_date), "d MMMM yyyy HH:mm", { locale: tr })}
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
                                    <TableCell className="text-right space-x-2">
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
