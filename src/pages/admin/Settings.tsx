import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash, Save, Bell, Send, MessageCircle, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseTimeRange, type WorkingHour } from "@/lib/booking";
import {
    getNotificationSettings,
    saveNotificationSettings,
    sendTelegramTestNotification,
    type NotificationSettings,
} from "@/lib/notificationService";

type Service = {
    title: string;
    description: string;
    icon: string;
    color: string;
    iconColor: string;
};

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const { toast } = useToast();

    // General Settings State
    const [generalData, setGeneralData] = useState({
        email: "",
        phone: "",
        address: "",
    });

    // Services State
    const [services, setServices] = useState<Service[]>([]);
    const [newService, setNewService] = useState<Service>({
        title: "",
        description: "",
        icon: "User",
        color: "bg-sage-light",
        iconColor: "text-sage-dark",
    });

    // Working Hours State
    const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

    // Notification Settings State
    const [notificationData, setNotificationData] = useState<NotificationSettings>({
        telegramEnabled: false,
        whatsappNumber: "",
    });
    const [testingTelegram, setTestingTelegram] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    useEffect(() => {
        const fetchAllSettings = async () => {
            try {
                const generalRef = doc(db, "settings", "general");
                const servicesRef = doc(db, "settings", "services");
                const hoursRef = doc(db, "settings", "workingHours");

                const [notifSettings, generalSnap, servicesSnap, hoursSnap] = await Promise.all([
                    getNotificationSettings(),
                    getDoc(generalRef),
                    getDoc(servicesRef),
                    getDoc(hoursRef),
                ]);

                // Notification Settings
                setNotificationData(notifSettings);

                // General Settings
                if (generalSnap.exists()) {
                    const data = generalSnap.data();
                    setGeneralData({
                        email: typeof data.email === "string" ? data.email : "",
                        phone: typeof data.phone === "string" ? data.phone : "",
                        address: typeof data.address === "string" ? data.address : "",
                    });
                } else {
                    setGeneralData({
                        email: "iletisim@sefasevim.com",
                        phone: "",
                        address: "Onikişubat, Kahramanmaraş",
                    });
                }

                // Services
                if (servicesSnap.exists() && servicesSnap.data().items) {
                    setServices(servicesSnap.data().items);
                } else {
                    const defaultServices = [
                        { title: "Bireysel Danışmanlık", description: "Kişisel gelişim, özgüven, ilişki sorunları ve yaşam zorlukları için birebir destek.", icon: "User", color: "bg-sage-light", iconColor: "text-sage-dark" },
                        { title: "Ergen Danışmanlığı", description: "Ergenlik döneminin zorluklarında gençlere ve ailelerine profesyonel rehberlik.", icon: "Users", color: "bg-beige-warm", iconColor: "text-secondary" },
                        { title: "Sınav Kaygısı", description: "Sınav stresi ve performans kaygısını yönetmek için etkili teknikler ve stratejiler.", icon: "Brain", color: "bg-sage-light", iconColor: "text-sage-dark" },
                        { title: "Kariyer Danışmanlığı", description: "Meslek seçimi, kariyer planlaması ve iş hayatı zorluklarında yol gösterici destek.", icon: "Compass", color: "bg-beige-warm", iconColor: "text-secondary" },
                        { title: "Online Terapi", description: "Evinizin konforunda, güvenli ve etkili online psikolojik danışmanlık hizmeti.", icon: "Monitor", color: "bg-sage-light", iconColor: "text-sage-dark" },
                    ];
                    setServices(defaultServices);
                }

                // Working Hours
                if (hoursSnap.exists() && hoursSnap.data().items) {
                    setWorkingHours(hoursSnap.data().items);
                } else {
                    setWorkingHours([
                        { day: "Pazartesi - Cuma", hours: "09:00 - 19:00" },
                        { day: "Cumartesi", hours: "10:00 - 16:00" },
                        { day: "Pazar", hours: "Kapalı" },
                    ]);
                }

            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Ayarlar yüklenirken bir hata oluştu.",
                });
            } finally {
                setFetching(false);
            }
        };
        fetchAllSettings();
    }, [toast]);

    // General Handlers
    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGeneralData({ ...generalData, [e.target.id]: e.target.value });
    };

    const saveGeneral = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "general"), generalData, { merge: true });
            toast({ title: "Başarılı", description: "İletişim bilgileri güncellendi." });
        } catch (error) {
            toast({ variant: "destructive", title: "Hata", description: "Kaydedilemedi." });
        } finally {
            setLoading(false);
        }
    };

    // Services Handlers
    const addService = () => {
        if (!newService.title) return;
        setServices([...services, newService]);
        setNewService({ title: "", description: "", icon: "User", color: "bg-sage-light", iconColor: "text-sage-dark" });
    };

    const removeService = (index: number) => {
        const newServices = [...services];
        newServices.splice(index, 1);
        setServices(newServices);
    };

    const saveServices = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "services"), { items: services });
            toast({ title: "Başarılı", description: "Hizmetler güncellendi." });
        } catch (error) {
            toast({ variant: "destructive", title: "Hata", description: "Kaydedilemedi." });
        } finally {
            setLoading(false);
        }
    };

    // Working Hours Handlers
    const handleHourChange = (index: number, value: string) => {
        const newHours = [...workingHours];
        newHours[index].hours = value;
        setWorkingHours(newHours);
    };

    const saveHours = async () => {
        const invalidHour = workingHours.find((item) => item.hours.trim().toLocaleLowerCase("tr-TR") !== "kapalı" && !parseTimeRange(item.hours));
        if (invalidHour) {
            toast({
                variant: "destructive",
                title: "Geçersiz saat aralığı",
                description: `${invalidHour.day} için “09:00 - 18:00” biçimini veya “Kapalı” değerini kullanın.`,
            });
            return;
        }
        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "workingHours"), {
                items: workingHours.map((item) => ({ ...item, hours: item.hours.trim() })),
            });
            toast({ title: "Başarılı", description: "Çalışma saatleri güncellendi." });
        } catch (error) {
            toast({ variant: "destructive", title: "Hata", description: "Kaydedilemedi." });
        } finally {
            setLoading(false);
        }
    };

    // Notification Handlers
    const saveNotifications = async () => {
        setSavingNotifications(true);
        try {
            await saveNotificationSettings(notificationData);
            toast({
                title: "Başarılı 🎉",
                description: "Bildirim ayarları başarıyla kaydedildi.",
            });
        } catch (error) {
            console.error("Bildirim ayarları kaydedilemedi:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Bildirim ayarları kaydedilirken bir hata oluştu.",
            });
        } finally {
            setSavingNotifications(false);
        }
    };

    const handleTestTelegram = async () => {
        setTestingTelegram(true);
        try {
            const res = await sendTelegramTestNotification();

            if (res.success) {
                toast({
                    title: "Test Başarılı! 🎉",
                    description: "Telegram botunuza test mesajı ulaştı. Telefonunuzu kontrol edebilirsiniz.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Test Mesajı Gönderilemedi",
                    description: res.error || "Lütfen Bot Token ve Chat ID bilgilerinizi kontrol edin.",
                });
            }
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Bağlantı Hatası",
                description: error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.",
            });
        } finally {
            setTestingTelegram(false);
        }
    };

    if (fetching) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ayarlar</h2>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 gap-1">
                    <TabsTrigger value="general" className="py-2.5">Genel</TabsTrigger>
                    <TabsTrigger value="services" className="py-2.5">Hizmetler</TabsTrigger>
                    <TabsTrigger value="hours" className="py-2.5">Çalışma Saatleri</TabsTrigger>
                    <TabsTrigger value="notifications" className="py-2.5 flex items-center justify-center gap-1.5">
                        <Bell className="h-4 w-4" /> Bildirimler
                    </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>İletişim Bilgileri</CardTitle>
                            <CardDescription>Sitede görünen iletişim bilgilerini güncelleyin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" value={generalData.email} onChange={handleGeneralChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" value={generalData.phone} onChange={handleGeneralChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Adres</Label>
                                <Textarea id="address" value={generalData.address} onChange={handleGeneralChange} />
                            </div>
                            <Button onClick={saveGeneral} disabled={loading} className="w-full sm:w-auto">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hizmet Yönetimi</CardTitle>
                            <CardDescription>Sunduğunuz hizmetleri ekleyin veya düzenleyin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {services.map((service, index) => (
                                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                                        <div>
                                            <h4 className="font-medium">{service.title}</h4>
                                            <p className="text-sm text-muted-foreground">{service.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Icon: {service.icon}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeService(index)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <h4 className="text-sm font-medium">Yeni Hizmet Ekle</h4>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Input
                                        placeholder="Başlık"
                                        value={newService.title}
                                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                                    />
                                    <Input
                                        placeholder="İkon Adı (örn: User, Brain)"
                                        value={newService.icon}
                                        onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Açıklama"
                                        className="sm:col-span-2"
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    />
                                </div>
                                <Button variant="outline" onClick={addService} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Ekle
                                </Button>
                            </div>

                            <Button onClick={saveServices} disabled={loading} className="w-full sm:w-auto">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" /> Değişiklikleri Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Working Hours Tab */}
                <TabsContent value="hours" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Çalışma Saatleri</CardTitle>
                            <CardDescription>Randevu alınabilecek saatleri düzenleyin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {workingHours.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                                    <Label className="sm:w-36 text-sm font-medium shrink-0">{item.day}</Label>
                                    <Input
                                        value={item.hours}
                                        onChange={(e) => handleHourChange(index, e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            ))}
                            <Button onClick={saveHours} disabled={loading} className="w-full sm:w-auto">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Send className="h-5 w-5 text-sky-500 shrink-0" />
                                        Telegram Anlık Bildirimleri
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Danışanlar web sitenizden randevu aldığında veya mesaj gönderdiğinde cebinize anlık bildirim gelsin.
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant={notificationData.telegramEnabled ? "default" : "secondary"}
                                    className="self-start sm:self-auto shrink-0"
                                >
                                    {notificationData.telegramEnabled ? "Aktif" : "Pasif"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Switch */}
                            <div className="flex items-center justify-between gap-4 p-4 bg-muted/40 rounded-xl border">
                                <div className="space-y-0.5 min-w-0">
                                    <Label htmlFor="telegram-switch" className="font-semibold text-sm sm:text-base">
                                        Telegram Bildirimlerini Etkinleştir
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Yeni randevu ve iletişim talepleri belirlenen Telegram sohbetine anında iletilir.
                                    </p>
                                </div>
                                <Switch
                                    id="telegram-switch"
                                    checked={notificationData.telegramEnabled}
                                    onCheckedChange={(checked) =>
                                        setNotificationData({ ...notificationData, telegramEnabled: checked })
                                    }
                                    className="shrink-0"
                                />
                            </div>

                            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 text-sm text-sky-950">
                                Bot anahtarı ve sohbet kimliği tarayıcıya gönderilmez. Değerler Firebase Secret Manager'da
                                <code className="mx-1">TELEGRAM_BOT_TOKEN</code> ve <code>TELEGRAM_CHAT_ID</code> adlarıyla saklanır.
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                                <Button
                                    onClick={saveNotifications}
                                    disabled={savingNotifications}
                                    className="gap-2 w-full sm:w-auto"
                                >
                                    {savingNotifications ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Bildirim Ayarlarını Kaydet
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleTestTelegram}
                                    disabled={testingTelegram}
                                    className="gap-2 w-full sm:w-auto"
                                >
                                    {testingTelegram ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4 text-sky-500" />
                                    )}
                                    Test Bildirimi Gönder
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Guidance Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-emerald-600" />
                                Danışman WhatsApp İletişim Hattı
                            </CardTitle>
                            <CardDescription>
                                Yönetim panelinden danışan randevuları onaylandığında gönderilen WhatsApp mesajları ve iletişim için kullanılan telefon numarası.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 max-w-md">
                                <Label htmlFor="whatsappNumber">WhatsApp Telefon Numarası</Label>
                                <Input
                                    id="whatsappNumber"
                                    placeholder="+90 555 123 4567"
                                    value={notificationData.whatsappNumber || ""}
                                    onChange={(e) =>
                                        setNotificationData({
                                            ...notificationData,
                                            whatsappNumber: e.target.value,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Boş bırakırsanız Genel Ayarlar sekmesindeki telefon numarası kullanılır.
                                </p>
                            </div>
                            <Button
                                onClick={saveNotifications}
                                disabled={savingNotifications}
                                variant="secondary"
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                WhatsApp Numarasını Kaydet
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Telegram Setup Guide */}
                    <Card className="border-sky-200 bg-sky-50/40 dark:bg-sky-950/20 dark:border-sky-900">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-sky-900 dark:text-sky-300">
                                <HelpCircle className="h-5 w-5 text-sky-600" />
                                💡 2 Dakikada Telegram Botu Nasıl Kurulur?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3 text-sky-950 dark:text-sky-200">
                            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                                <li>
                                    Telegram uygulamasında arama yerine <b>@BotFather</b> yazın ve sohbeti başlatın.
                                </li>
                                <li>
                                    Sohbete <code>/newbot</code> komutunu gönderin. Botunuz için bir isim (örn: <i>Sefa Bildirim</i>) ve sonu <code>bot</code> ile biten bir kullanıcı adı (örn: <i>sefasevim_bildirim_bot</i>) yazın.
                                </li>
                                <li>
                                    BotFather'ın verdiği anahtarı terminalde <code>npx firebase-tools functions:secrets:set TELEGRAM_BOT_TOKEN</code> komutuyla güvenli kasaya kaydedin.
                                </li>
                                <li>
                                    Sohbet kimliğini <code>npx firebase-tools functions:secrets:set TELEGRAM_CHAT_ID</code> komutuyla kaydedip Functions'ı yeniden dağıtın.
                                </li>
                                <li>
                                    <b>Önemli:</b> Telegram kuralları gereği botların size mesaj atabilmesi için oluşturduğunuz botun sohbetine gidip bir kez <b>"Başlat" (/start)</b> butonuna tıklayın.
                                </li>
                                <li>
                                    Yukarıdaki <b>"Test Bildirimi Gönder"</b> butonuna basarak telefonunuza gelen bildirimi hemen görün!
                                </li>
                            </ol>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
