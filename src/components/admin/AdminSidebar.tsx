import {
    Calendar,
    LayoutDashboard,
    Settings,
    LogOut,
    MessageSquare,
    Home,
    FileText,
    Image,
    HelpCircle,
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
    useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
        title: "İçerik Yönetimi",
        url: "/admin/content",
        icon: FileText,
    },
    {
        title: "Medya",
        url: "/admin/media",
        icon: Image,
    },
    {
        title: "SSS",
        url: "/admin/faq",
        icon: HelpCircle,
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
    const { isMobile, setOpenMobile } = useSidebar();

    const handleItemClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const handleLogout = async () => {
        if (isMobile) {
            setOpenMobile(false);
        }
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
                                        <Link to={item.url} onClick={handleItemClick}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
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
                        <SidebarMenuButton asChild>
                            <a href="/" target="_blank" rel="noopener noreferrer" onClick={handleItemClick}>
                                <Home />
                                <span>Siteye Dön</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
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
