import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, Save } from "lucide-react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function MediaManagement() {
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [aboutImage, setAboutImage] = useState<string>("");
    const { toast } = useToast();

    useEffect(() => {
        // Load existing image URL from Firestore
        const loadImage = async () => {
            try {
                const docRef = doc(db, "settings", "media");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().aboutImage) {
                    setAboutImage(docSnap.data().aboutImage);
                }
            } catch (error) {
                console.error("Error loading image:", error);
            }
        };
        loadImage();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Lütfen geçerli bir resim dosyası seçin.",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Dosya boyutu 5MB'dan küçük olmalıdır.",
            });
            return;
        }

        setUploading(true);
        try {
            // Create a reference to the file in Firebase Storage
            const storageRef = ref(storage, `images/${imageType}-${Date.now()}.${file.name.split('.').pop()}`);

            // Upload the file
            await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);

            if (imageType === 'about') {
                setAboutImage(downloadURL);
            }

            toast({
                title: "Başarılı",
                description: "Resim yüklendi. Kaydetmeyi unutmayın!",
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Resim yüklenirken bir hata oluştu.",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSaveImage = async () => {
        if (!aboutImage) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Lütfen önce bir resim yükleyin.",
            });
            return;
        }

        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "media"), {
                aboutImage: aboutImage,
                updatedAt: new Date().toISOString(),
            });

            toast({
                title: "Başarılı",
                description: "Fotoğraf kaydedildi ve sitede görünecek.",
            });
        } catch (error) {
            console.error("Error saving image:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Fotoğraf kaydedilirken bir hata oluştu.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Medya Yönetimi</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Hakkımda Bölümü Fotoğrafı</CardTitle>
                    <CardDescription>
                        Hakkımda bölümünde görünecek fotoğrafı yükleyin. Önerilen boyut: 800x800px
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {aboutImage && (
                        <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-border">
                            <img
                                src={aboutImage}
                                alt="Hakkımda Fotoğrafı"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="about-image">Fotoğraf Seç</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="about-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'about')}
                                disabled={uploading}
                                className="max-w-md"
                            />
                            {uploading && (
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            JPG, PNG veya WebP formatında, maksimum 5MB
                        </p>
                    </div>

                    {aboutImage && (
                        <Button
                            onClick={handleSaveImage}
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Kaydet
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Görseller</CardTitle>
                    <CardDescription>
                        Sitede kullanılan görselleri buradan yönetebilirsiniz.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {aboutImage ? (
                            <div className="aspect-square rounded-lg border-2 border-border overflow-hidden">
                                <img
                                    src={aboutImage}
                                    alt="Hakkımda"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">Henüz görsel yok</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
