import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>

            <Tabs defaultValue="general" className="w-full">
                <TabsList>
                    <TabsTrigger value="general">Genel</TabsTrigger>
                    <TabsTrigger value="services">Hizmetler</TabsTrigger>
                    <TabsTrigger value="hours">Çalışma Saatleri</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>İletişim Bilgileri</CardTitle>
                            <CardDescription>
                                Sitede görünen iletişim bilgilerini güncelleyin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" defaultValue="iletisim@sefasevim.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" defaultValue="+90 555 123 4567" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Adres</Label>
                                <Textarea id="address" defaultValue="İstanbul, Türkiye" />
                            </div>
                            <Button>Kaydet</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hizmet Yönetimi</CardTitle>
                            <CardDescription>
                                Sunduğunuz hizmetleri buradan düzenleyebilirsiniz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Hizmet düzenleme özelliği yakında eklenecek.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hours">
                    <Card>
                        <CardHeader>
                            <CardTitle>Çalışma Saatleri</CardTitle>
                            <CardDescription>
                                Randevu alınabilecek saatleri düzenleyin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Çalışma saatleri düzenleme özelliği yakında eklenecek.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
