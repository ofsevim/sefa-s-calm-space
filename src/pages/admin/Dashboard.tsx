import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        totalClients: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                const appointmentsRef = collection(db, "appointments");

                // Total Appointments
                const totalSnapshot = await getCountFromServer(appointmentsRef);
                const totalAppointments = totalSnapshot.data().count;

                // Pending Appointments
                const pendingQuery = query(appointmentsRef, where("status", "==", "pending"));
                const pendingSnapshot = await getCountFromServer(pendingQuery);
                const pendingAppointments = pendingSnapshot.data().count;

                // For clients, we can't easily get unique count with simple queries without reading all docs.
                // For now, let's just show total appointments or maybe remove it?
                // Let's stick to Total Appointments and Pending.
                // Or maybe just assume 1 appointment = 1 client interaction for now.

                setStats({
                    totalAppointments,
                    pendingAppointments,
                    totalClients: totalAppointments, // Simplified for now
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Panel</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                        <p className="text-xs text-muted-foreground">
                            Tüm zamanlar
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bekleyen Onay</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
                        <p className="text-xs text-muted-foreground">
                            İşlem gerektiriyor
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
