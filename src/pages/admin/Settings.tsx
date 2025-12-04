import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash, Save } from "lucide-react";

type Service = {
    title: string;
    description: string;
    icon: string;
    color: string;
    iconColor: string;
};

type WorkingHour = {
    day: string;
    hours: string;
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

    useEffect(() => {
        const fetchAllSettings = async () => {
            try {
                // Fetch General Settings
                const generalRef = doc(db, "settings", "general");
                const generalSnap = await getDoc(generalRef);
                if (generalSnap.exists()) {
                    setGeneralData(generalSnap.data() as typeof generalData);
                } else {
                    setGeneralData({
                        email: "iletisim@sefasevim.com",
                        phone: "+90 555 123 4567",
                        address: "Onikişubat, Kahramanmaraş",
                    });
                }

                // Fetch Services
                const servicesRef = doc(db, "settings", "services");
                const servicesSnap = await getDoc(servicesRef);
                if (servicesSnap.exists() && servicesSnap.data().items) {
                    setServices(servicesSnap.data().items);
                } else {
                    // Default services if empty - save them to Firestore
                    const defaultServices = [
                        { title: "Bireysel Danışmanlık", description: "Kişisel gelişim, özgüven, ilişki sorunları ve yaşam zorlukları için birebir destek.", icon: "User", color: "bg-sage-light", iconColor: "text-sage-dark" },
                        { title: "Ergen Danışmanlığı", description: "Ergenlik döneminin zorluklarında gençlere ve ailelerine profesyonel rehberlik.", icon: "Users", color: "bg-beige-warm", iconColor: "text-secondary" },
                        { title: "Sınav Kaygısı", description: "Sınav stresi ve performans kaygısını yönetmek için etkili teknikler ve stratejiler.", icon: "Brain", color: "bg-sage-light", iconColor: "text-sage-dark" },
                        { title: "Kariyer Danışmanlığı", description: "Meslek seçimi, kariyer planlaması ve iş hayatı zorluklarında yol gösterici destek.", icon: "Compass", color: "bg-beige-warm", iconColor: "text-secondary" },
                        { title: "Online Terapi", description: "Evinizin konforunda, güvenli ve etkili online psikolojik danışmanlık hizmeti.", icon: "Monitor", color: "bg-sage-light", iconColor: "text-sage-dark" },
                    ];
                    setServices(defaultServices);
                    // Save to Firestore
                    await setDoc(servicesRef, { items: defaultServices });
                }

                // Fetch Working Hours
                const hoursRef = doc(db, "settings", "workingHours");
                const hoursSnap = await getDoc(hoursRef);
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
            await setDoc(doc(db, "settings", "general"), generalData);
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
        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "workingHours"), { items: workingHours });
            toast({ title: "Başarılı", description: "Çalışma saatleri güncellendi." });
        } catch (error) {
            toast({ variant: "destructive", title: "Hata", description: "Kaydedilemedi." });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="flex items-center justify-center h-64">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>

            <Tabs defaultValue="general" className="w-full">
                <TabsList>
                    <TabsTrigger value="general">Genel</TabsTrigger>
                    <TabsTrigger value="services">Hizmetler</TabsTrigger>
                    <TabsTrigger value="hours">Çalışma Saatleri</TabsTrigger>
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
                            <Button onClick={saveGeneral} disabled={loading}>
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
                                <div key={index} className="flex items-center gap-4">
                                    <Label className="w-32">{item.day}</Label>
                                    <Input
                                        value={item.hours}
                                        onChange={(e) => handleHourChange(index, e.target.value)}
                                    />
                                </div>
                            ))}
                            <Button onClick={saveHours} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
