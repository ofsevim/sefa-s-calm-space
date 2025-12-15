import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2,
    Image as ImageIcon,
    Save,
    Trash2,
    CheckCircle2,
    Upload,
    X,
    ZoomIn,
    Calendar,
    FileImage,
    RefreshCw
} from "lucide-react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StorageImage {
    name: string;
    url: string;
    fullPath: string;
    uploadedAt: string;
    size: number;
}

export default function MediaManagement() {
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [aboutImage, setAboutImage] = useState<string>("");
    const [allImages, setAllImages] = useState<StorageImage[]>([]);
    const [selectedPreview, setSelectedPreview] = useState<StorageImage | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<StorageImage | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [heroImage, setHeroImage] = useState<string>("");
    const { toast } = useToast();

    // Load existing image URL from Firestore and all images from Storage
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load current about image setting
            const docRef = doc(db, "settings", "media");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().aboutImage) {
                setAboutImage(docSnap.data().aboutImage);
            }

            // Load current hero image setting
            const heroDocRef = doc(db, "content", "hero");
            const heroDocSnap = await getDoc(heroDocRef);
            if (heroDocSnap.exists() && heroDocSnap.data().heroImage) {
                setHeroImage(heroDocSnap.data().heroImage);
            }

            // Load all images from Firebase Storage
            await loadAllImages();
        } catch (error) {
            console.error("Error loading data:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Veriler yüklenirken bir hata oluştu.",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadAllImages = async () => {
        try {
            const imagesRef = ref(storage, 'images');
            const result = await listAll(imagesRef);

            const imagePromises = result.items.map(async (item) => {
                try {
                    const url = await getDownloadURL(item);
                    const metadata = await getMetadata(item);
                    return {
                        name: item.name,
                        url: url,
                        fullPath: item.fullPath,
                        uploadedAt: metadata.timeCreated,
                        size: metadata.size,
                    };
                } catch (error) {
                    console.error("Error loading image:", item.name, error);
                    return null;
                }
            });

            const images = (await Promise.all(imagePromises)).filter(Boolean) as StorageImage[];
            // Sort by upload date (newest first)
            images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            setAllImages(images);
        } catch (error) {
            console.error("Error listing images:", error);
            // If folder doesn't exist, that's okay
            setAllImages([]);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const file of Array.from(files)) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                errorCount++;
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                errorCount++;
                continue;
            }

            try {
                // Create a reference to the file in Firebase Storage
                const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                const storageRef = ref(storage, `images/${fileName}`);

                // Upload the file
                await uploadBytes(storageRef, file);
                successCount++;
            } catch (error) {
                console.error("Error uploading image:", error);
                errorCount++;
            }
        }

        // Reload images after upload
        await loadAllImages();

        if (successCount > 0) {
            toast({
                title: "Başarılı",
                description: `${successCount} görsel yüklendi.${errorCount > 0 ? ` ${errorCount} görsel yüklenemedi.` : ''}`,
            });
        } else if (errorCount > 0) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Görseller yüklenemedi. Dosya formatını ve boyutunu kontrol edin.",
            });
        }

        setUploading(false);
        // Reset the input
        e.target.value = '';
    };

    const handleDeleteImage = async (image: StorageImage) => {
        setDeleting(true);
        try {
            const imageRef = ref(storage, image.fullPath);
            await deleteObject(imageRef);

            // If this was the about image, clear it
            if (aboutImage === image.url) {
                setAboutImage("");
                await setDoc(doc(db, "settings", "media"), {
                    aboutImage: "",
                    updatedAt: new Date().toISOString(),
                });
            }

            // Remove from local state
            setAllImages(prev => prev.filter(img => img.fullPath !== image.fullPath));

            toast({
                title: "Başarılı",
                description: "Görsel silindi.",
            });
        } catch (error) {
            console.error("Error deleting image:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Görsel silinirken bir hata oluştu.",
            });
        } finally {
            setDeleting(false);
            setDeleteConfirm(null);
        }
    };

    const handleSetAsAboutImage = async (image: StorageImage) => {
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "media"), {
                aboutImage: image.url,
                updatedAt: new Date().toISOString(),
            });

            setAboutImage(image.url);

            toast({
                title: "Başarılı",
                description: "Hakkımda fotoğrafı güncellendi.",
            });
        } catch (error) {
            console.error("Error setting about image:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Fotoğraf güncellenirken bir hata oluştu.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSetAsHeroImage = async (image: StorageImage) => {
        setSaving(true);
        try {
            // Get current hero content to preserve other fields
            const heroDocRef = doc(db, "content", "hero");
            const heroDocSnap = await getDoc(heroDocRef);

            if (heroDocSnap.exists()) {
                const currentData = heroDocSnap.data();
                await setDoc(heroDocRef, {
                    ...currentData,
                    heroImage: image.url
                });
                setHeroImage(image.url);

                toast({
                    title: "Başarılı",
                    description: "Anasayfa Hero fotoğrafı güncellendi.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Hero içerik verisi bulunamadı.",
                });
            }

        } catch (error) {
            console.error("Error setting hero image:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Fotoğraf güncellenirken bir hata oluştu.",
            });
        } finally {
            setSaving(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Görseller yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Medya Yönetimi</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData()}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Yenile
                </Button>
            </div>

            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Yeni Görsel Yükle
                    </CardTitle>
                    <CardDescription>
                        Birden fazla görsel seçerek aynı anda yükleyebilirsiniz. Maksimum 5MB, JPG/PNG/WebP formatı.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Label
                                htmlFor="image-upload"
                                className={`
                                    flex items-center justify-center gap-2 px-6 py-8
                                    border-2 border-dashed border-primary/30 rounded-lg
                                    cursor-pointer hover:border-primary/50 hover:bg-primary/5
                                    transition-all duration-200 flex-1
                                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">Yükleniyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-primary" />
                                        <span className="text-muted-foreground">
                                            Görsel seçmek için tıklayın veya sürükleyip bırakın
                                        </span>
                                    </>
                                )}
                            </Label>
                            <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current About Image */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        Hakkımda Bölümü Fotoğrafı
                    </CardTitle>
                    <CardDescription>
                        Sitedeki Hakkımda bölümünde görünen aktif fotoğraf
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {aboutImage ? (
                        <div className="flex items-start gap-4">
                            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                                <img
                                    src={aboutImage}
                                    alt="Hakkımda Fotoğrafı"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Bu fotoğraf şu an sitede aktif olarak görünüyor.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Değiştirmek için aşağıdaki galeriden başka bir fotoğraf seçin.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Fotoğraf Seçilmedi</p>
                                <p className="text-sm text-muted-foreground">
                                    Aşağıdaki galeriden bir fotoğraf seçerek Hakkımda bölümüne ekleyin.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current Hero Image */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        Hero Bölümü Fotoğrafı
                    </CardTitle>
                    <CardDescription>
                        Anasayfada görünen büyük görsel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {heroImage ? (
                        <div className="flex items-start gap-4">
                            <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                                <img
                                    src={heroImage}
                                    alt="Hero Fotoğrafı"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Bu fotoğraf şu an anasayfada aktif olarak görünüyor.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Fotoğraf Seçilmedi</p>
                                <p className="text-sm text-muted-foreground">
                                    Varsayılan görsel kullanılıyor.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Image Gallery */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileImage className="h-5 w-5 text-primary" />
                        Görsel Galerisi
                        {allImages.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({allImages.length} görsel)
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Yüklenen tüm görseller. Bir görsele tıklayarak önizleyin veya Hakkımda bölümüne atayın.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {allImages.map((image) => (
                                <div
                                    key={image.fullPath}
                                    className={`
                                        group relative aspect-square rounded-lg overflow-hidden
                                        border-2 transition-all duration-200 cursor-pointer
                                        ${aboutImage === image.url
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-border hover:border-primary/50'
                                        }
                                    `}
                                    onClick={() => setSelectedPreview(image)}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />

                                    {/* Active indicator */}
                                    {(aboutImage === image.url || heroImage === image.url) && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow-lg" />
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <ZoomIn className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Henüz görsel yok</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Yukarıdaki yükleme alanını kullanarak ilk görselinizi yükleyin.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Image Preview Dialog */}
            <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="truncate pr-8">{selectedPreview?.name}</DialogTitle>
                        <DialogDescription>
                            Görsel detayları ve işlemler
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPreview && (
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-[60vh]">
                                <img
                                    src={selectedPreview.url}
                                    alt={selectedPreview.name}
                                    className="max-w-full max-h-[60vh] object-contain"
                                />
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <FileImage className="h-4 w-4" />
                                    <span>{formatFileSize(selectedPreview.size)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(selectedPreview.uploadedAt)}</span>
                                </div>
                                {aboutImage === selectedPreview.url && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Aktif Hakkımda fotoğrafı</span>
                                    </div>
                                )}
                                {heroImage === selectedPreview.url && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Aktif Hero fotoğrafı</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {selectedPreview && aboutImage !== selectedPreview.url && (
                            <Button
                                onClick={() => {
                                    handleSetAsAboutImage(selectedPreview);
                                    setSelectedPreview(null);
                                }}
                                disabled={saving}
                                className="w-full sm:w-auto"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Hakkımda Fotoğrafı Yap
                            </Button>
                        )}
                        {selectedPreview && heroImage !== selectedPreview.url && (
                            <Button
                                onClick={() => {
                                    handleSetAsHeroImage(selectedPreview);
                                    setSelectedPreview(null);
                                }}
                                disabled={saving}
                                className="w-full sm:w-auto"
                                variant="secondary"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Hero Fotoğrafı Yap
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setDeleteConfirm(selectedPreview);
                                setSelectedPreview(null);
                            }}
                            className="w-full sm:w-auto"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Görseli Sil
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Kapat
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Görseli Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu görseli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            {deleteConfirm && aboutImage === deleteConfirm.url && (
                                <span className="block mt-2 text-destructive font-medium">
                                    ⚠️ Bu görsel şu an Hakkımda bölümünde kullanılıyor. Silindikten sonra bölümde görsel görünmeyecek.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirm && handleDeleteImage(deleteConfirm)}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Siliniyor...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Evet, Sil
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
