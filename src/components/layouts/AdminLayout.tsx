import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { isAdminUser } from "@/lib/adminAuth";
import { Helmet } from "react-helmet-async";

export default function AdminLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
            try {
                if (currentUser && await isAdminUser(currentUser)) {
                    setUser(currentUser);
                } else {
                    setUser(null);
                    if (currentUser) await signOut(auth);
                }
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium">Yönetim paneli yükleniyor...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <SidebarProvider>
            <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
            <AdminSidebar />
            <main className="min-w-0 flex-1 overflow-x-clip bg-background">
                <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <SidebarTrigger />
                    <h1 className="font-semibold text-base sm:text-lg truncate">Yönetim Paneli</h1>
                </div>
                <div className="p-3 sm:p-6">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
}
