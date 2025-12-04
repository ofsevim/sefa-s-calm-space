import {
    Calendar,
    LayoutDashboard,
    Settings,
    LogOut,
    MessageSquare,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const items = [
    {
        title: "Panel",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Randevular",
        url: "/admin/appointments",
        icon: Calendar,
    },
    {
        title: "Mesajlar",
        url: "/admin/messages",
        icon: MessageSquare,
    },
    {
        title: "Ayarlar",
        url: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const handleLogout = async () => {
        await signOut(auth);
        toast({
            title: "Çıkış yapıldı",
            description: "Başarıyla çıkış yaptınız.",
        });
        navigate("/admin/login");
    };

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Yönetim Paneli</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url}
                                    >
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout}>
                            <LogOut />
                            <span>Çıkış Yap</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
