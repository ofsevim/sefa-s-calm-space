import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Mail, TrendingUp, TrendingDown, CalendarCheck, MessageSquare, Check, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where, getDocs, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TodayAppointment {
    id: string;
    client_name: string;
    appointment_date: string;
    status: string;
}

interface PendingAppointment {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    appointment_date: string;
    status: string;
}

interface RecentMessage {
    id: string;
    name: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        approvedAppointments: 0,
        unreadMessages: 0,
        todayAppointmentsCount: 0,
        weeklyTrend: 0,
    });
    const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
    const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
    const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const appointmentsRef = collection(db, "appointments");
                const messagesRef = collection(db, "messages");

                // Total Appointments
                const totalSnapshot = await getCountFromServer(appointmentsRef);
                const totalAppointments = totalSnapshot.data().count;

                // Pending Appointments
                const pendingQuery = query(appointmentsRef, where("status", "==", "pending"));
                const pendingSnapshot = await getCountFromServer(pendingQuery);
                const pendingAppointments = pendingSnapshot.data().count;

                // Approved Appointments
                const approvedQuery = query(appointmentsRef, where("status", "==", "approved"));
                const approvedSnapshot = await getCountFromServer(approvedQuery);
                const approvedAppointments = approvedSnapshot.data().count;

                // Unread Messages
                const unreadQuery = query(messagesRef, where("read", "==", false));
                const unreadSnapshot = await getCountFromServer(unreadQuery);
                const unreadMessages = unreadSnapshot.data().count;

                // Today's Appointments
                const today = new Date();
                const todayStart = startOfDay(today).toISOString();
                const todayEnd = endOfDay(today).toISOString();

                const todayQuery = query(
                    appointmentsRef,
                    where("appointment_date", ">=", todayStart),
                    where("appointment_date", "<=", todayEnd),
                    orderBy("appointment_date", "asc")
                );
                const todaySnapshot = await getDocs(todayQuery);
                const todayAppts: TodayAppointment[] = [];
                todaySnapshot.forEach((doc) => {
                    todayAppts.push({ id: doc.id, ...doc.data() } as TodayAppointment);
                });
                setTodayAppointments(todayAppts);

                // Weekly Trend (this week vs last week)
                const thisWeekStart = subDays(today, 7).toISOString();
                const lastWeekStart = subDays(today, 14).toISOString();
                const lastWeekEnd = subDays(today, 7).toISOString();

                const thisWeekQuery = query(
                    appointmentsRef,
                    where("created_at", ">=", thisWeekStart)
                );
                const lastWeekQuery = query(
                    appointmentsRef,
                    where("created_at", ">=", lastWeekStart),
                    where("created_at", "<", lastWeekEnd)
                );

                const thisWeekSnapshot = await getCountFromServer(thisWeekQuery);
                const lastWeekSnapshot = await getCountFromServer(lastWeekQuery);

                const thisWeekCount = thisWeekSnapshot.data().count;
                const lastWeekCount = lastWeekSnapshot.data().count;
                const weeklyTrend = lastWeekCount > 0
                    ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
                    : thisWeekCount > 0 ? 100 : 0;

                // Pending Appointments (for approval list)
                const pendingDetailsQuery = query(
                    appointmentsRef,
                    where("status", "==", "pending"),
                    orderBy("created_at", "desc"),
                    limit(5)
                );
                const pendingDetailsSnapshot = await getDocs(pendingDetailsQuery);
                const pendingAppts: PendingAppointment[] = [];
                pendingDetailsSnapshot.forEach((doc) => {
                    pendingAppts.push({ id: doc.id, ...doc.data() } as PendingAppointment);
                });
                setPendingAppointments(pendingAppts);

                // Recent Messages
                const recentMsgQuery = query(
                    messagesRef,
                    orderBy("createdAt", "desc"),
                    limit(5)
                );
                const recentMsgSnapshot = await getDocs(recentMsgQuery);
                const recentMsgs: RecentMessage[] = [];
                recentMsgSnapshot.forEach((doc) => {
                    recentMsgs.push({ id: doc.id, ...doc.data() } as RecentMessage);
                });
                setRecentMessages(recentMsgs);

                setStats({
                    totalAppointments,
                    pendingAppointments,
                    approvedAppointments,
                    unreadMessages,
                    todayAppointmentsCount: todayAppts.length,
                    weeklyTrend,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const refreshData = async () => {
        const appointmentsRef = collection(db, "appointments");

        // Refresh pending appointments
        const pendingDetailsQuery = query(
            appointmentsRef,
            where("status", "==", "pending"),
            orderBy("created_at", "desc"),
            limit(5)
        );
        const pendingDetailsSnapshot = await getDocs(pendingDetailsQuery);
        const pendingAppts: PendingAppointment[] = [];
        pendingDetailsSnapshot.forEach((doc) => {
            pendingAppts.push({ id: doc.id, ...doc.data() } as PendingAppointment);
        });
        setPendingAppointments(pendingAppts);

        // Refresh pending count
        const pendingQuery = query(appointmentsRef, where("status", "==", "pending"));
        const pendingSnapshot = await getCountFromServer(pendingQuery);
        setStats(prev => ({ ...prev, pendingAppointments: pendingSnapshot.data().count }));
    };

    const updateStatus = async (id: string, status: "approved" | "rejected") => {
        try {
            const appointmentRef = doc(db, "appointments", id);
            await updateDoc(appointmentRef, { status });

            // Refresh the data
            await refreshData();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Bekliyor</Badge>;
            case "approved":
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Onaylı</Badge>;
            case "rejected":
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Reddedildi</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Panel</h2>
                <p className="text-muted-foreground">
                    {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                {stats.weeklyTrend >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={stats.weeklyTrend >= 0 ? "text-green-600" : "text-red-600"}>
                                    {stats.weeklyTrend >= 0 ? "+" : ""}{stats.weeklyTrend}%
                                </span>
                                <span className="ml-1">geçen haftaya göre</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bekleyen Onay</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                İşlem gerektiriyor
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Onaylı Randevular</CardTitle>
                            <CalendarCheck className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approvedAppointments}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Aktif randevular
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Okunmamış Mesaj</CardTitle>
                            <Mail className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Yeni mesajlar
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Pending Appointments - Onay Bekleyen Randevular */}
            {pendingAppointments.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                Onay Bekleyen Randevular
                            </CardTitle>
                            <CardDescription>
                                İşlem gerektiren {pendingAppointments.length} randevu
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-yellow-100 dark:border-yellow-900"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                                <Users className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{apt.client_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(apt.appointment_date), "d MMMM yyyy, HH:mm", { locale: tr })}
                                                </p>
                                                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                                    <span>{apt.client_email}</span>
                                                    <span>•</span>
                                                    <span>{apt.client_phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                                onClick={() => updateStatus(apt.id, "approved")}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Onayla
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                                onClick={() => updateStatus(apt.id, "rejected")}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Reddet
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Today's Appointments & Recent Messages */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Today's Appointments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5 text-primary" />
                                Bugünkü Randevular
                            </CardTitle>
                            <CardDescription>
                                {format(new Date(), "d MMMM yyyy", { locale: tr })} tarihli randevular
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {todayAppointments.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Bugün için randevu yok</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todayAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{apt.client_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(apt.appointment_date), "HH:mm", { locale: tr })}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusBadge(apt.status)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Messages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Son Mesajlar
                            </CardTitle>
                            <CardDescription>
                                En son gelen 5 mesaj
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentMessages.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Henüz mesaj yok</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-3 rounded-lg ${msg.read ? 'bg-muted/30' : 'bg-blue-50 dark:bg-blue-950/20'}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-sm">{msg.name}</p>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(msg.createdAt), "d MMM HH:mm", { locale: tr })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {msg.message}
                                            </p>
                                            {!msg.read && (
                                                <Badge variant="secondary" className="mt-2 text-xs">Yeni</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
