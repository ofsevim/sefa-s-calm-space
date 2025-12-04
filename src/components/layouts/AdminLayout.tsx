import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminLayout() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="w-full">
                <div className="p-4 border-b flex items-center gap-4">
                    <SidebarTrigger />
                    <h1 className="font-semibold text-lg">Yönetim Paneli</h1>
                </div>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
}
