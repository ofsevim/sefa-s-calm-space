import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2,
    Image as ImageIcon,
    Save,
    Trash2,
    CheckCircle2,
    ZoomIn,
    Calendar,
    FileImage,
    RefreshCw,
    ExternalLink,
    Sparkles,
    Link2,
    Plus,
    Check
} from "lucide-react";
import { storage, db } from "@/lib/firebase";
import { ref, getDownloadURL, listAll, deleteObject, getMetadata } from "firebase/storage";
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
import { parseImageUrl, resolveImageUrl, isImgbbViewerUrl } from "@/lib/imageUtils";

interface StorageImage {
    name: string;
    url: string;
    fullPath: string;
    uploadedAt: string;
    size: number;
    isExternal?: boolean;
}

export default function MediaManagement() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [aboutImage, setAboutImage] = useState<string>("");
    const [heroImage, setHeroImage] = useState<string>("");
    const [allImages, setAllImages] = useState<StorageImage[]>([]);
    const [selectedPreview, setSelectedPreview] = useState<StorageImage | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<StorageImage | null>(null);
    const [deleting, setDeleting] = useState(false);

    // URL Inputs & States
    const [manualAboutUrl, setManualAboutUrl] = useState<string>("");
    const [manualHeroUrl, setManualHeroUrl] = useState<string>("");
    const [manualGalleryUrl, setManualGalleryUrl] = useState<string>("");

    const [isResolvingAbout, setIsResolvingAbout] = useState(false);
    const [isResolvingHero, setIsResolvingHero] = useState(false);
    const [isResolvingGallery, setIsResolvingGallery] = useState(false);

    const { toast } = useToast();

    // Load existing image URL from Firestore and all images
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load current about image & external gallery images
            const docRef = doc(db, "settings", "media");
            const docSnap = await getDoc(docRef);
            let externalImages: StorageImage[] = [];
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.aboutImage) {
                    setAboutImage(data.aboutImage);
                }
                if (Array.isArray(data.externalImages)) {
                    externalImages = data.externalImages;
                }
            }

            // Load current hero image setting
            const heroDocRef = doc(db, "content", "hero");
            const heroDocSnap = await getDoc(heroDocRef);
            if (heroDocSnap.exists() && heroDocSnap.data().heroImage) {
                setHeroImage(heroDocSnap.data().heroImage);
            }

            // Load all images from Firebase Storage merged with external images
            await loadAllImages(externalImages);
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

    const loadAllImages = async (externalImagesList?: StorageImage[]) => {
        try {
            let externalImgs = externalImagesList;
            if (!externalImgs) {
                const docRef = doc(db, "settings", "media");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && Array.isArray(docSnap.data().externalImages)) {
                    externalImgs = docSnap.data().externalImages;
                } else {
                    externalImgs = [];
                }
            }

            let storageImages: StorageImage[] = [];
            try {
                const imagesRef = ref(storage, "images");
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
                            isExternal: false,
                        };
                    } catch (error) {
                        console.error("Error loading image:", item.name, error);
                        return null;
                    }
                });

                storageImages = (await Promise.all(imagePromises)).filter(Boolean) as StorageImage[];
            } catch (storageError) {
                console.warn("Firebase storage check:", storageError);
            }

            const combined = [...(externalImgs || []), ...storageImages];
            // Sort by upload date (newest first)
            combined.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            setAllImages(combined);
        } catch (error) {
            console.error("Error listing images:", error);
            setAllImages([]);
        }
    };

    // Helper: Add external image record to Firestore so it shows in the gallery
    const addExternalImageRecord = async (imageUrl: string, namePrefix = "Görsel") => {
        try {
            const docRef = doc(db, "settings", "media");
            const docSnap = await getDoc(docRef);
            const currentExt = (docSnap.exists() && Array.isArray(docSnap.data().externalImages)
                ? docSnap.data().externalImages
                : []) as StorageImage[];

            if (!currentExt.some((img) => img.url === imageUrl)) {
                const newImg: StorageImage = {
                    name: `${namePrefix} (${new Date().toLocaleDateString("tr-TR")})`,
                    url: imageUrl,
                    fullPath: `external/${Date.now()}`,
                    uploadedAt: new Date().toISOString(),
                    size: 0,
                    isExternal: true,
                };
                const updated = [newImg, ...currentExt];
                await setDoc(docRef, { externalImages: updated }, { merge: true });
                setAllImages((prev) => [newImg, ...prev.filter((i) => i.url !== imageUrl)]);
            }
        } catch (err) {
            console.error("Error saving external image record:", err);
        }
    };

    const handleDeleteImage = async (image: StorageImage) => {
        setDeleting(true);
        try {
            if (image.isExternal) {
                // Remove from Firestore externalImages list
                const docRef = doc(db, "settings", "media");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const currentExt = (docSnap.data().externalImages || []) as StorageImage[];
                    const updated = currentExt.filter((img) => img.url !== image.url);
                    await setDoc(docRef, { ...docSnap.data(), externalImages: updated }, { merge: true });
                }
            } else {
                try {
                    const imageRef = ref(storage, image.fullPath);
                    await deleteObject(imageRef);
                } catch (err) {
                    console.warn("Storage deletion skipped:", err);
                }
            }

            // If this was the about image, clear it
            if (aboutImage === image.url) {
                setAboutImage("");
                await setDoc(
                    doc(db, "settings", "media"),
                    {
                        aboutImage: "",
                        updatedAt: new Date().toISOString(),
                    },
                    { merge: true }
                );
            }

            // If this was the hero image, clear it
            if (heroImage === image.url) {
                setHeroImage("");
                const heroDocRef = doc(db, "content", "hero");
                const heroDocSnap = await getDoc(heroDocRef);
                if (heroDocSnap.exists()) {
                    await setDoc(heroDocRef, { ...heroDocSnap.data(), heroImage: "" });
                }
            }

            // Remove from local state
            setAllImages((prev) => prev.filter((img) => img.url !== image.url));

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
            await setDoc(
                doc(db, "settings", "media"),
                {
                    aboutImage: image.url,
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );

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
            const heroDocRef = doc(db, "content", "hero");
            const heroDocSnap = await getDoc(heroDocRef);

            if (heroDocSnap.exists()) {
                const currentData = heroDocSnap.data();
                await setDoc(heroDocRef, {
                    ...currentData,
                    heroImage: image.url,
                });
                setHeroImage(image.url);

                toast({
                    title: "Başarılı",
                    description: "Anasayfa Hero fotoğrafı güncellendi.",
                });
            } else {
                await setDoc(heroDocRef, { heroImage: image.url });
                setHeroImage(image.url);
                toast({
                    title: "Başarılı",
                    description: "Anasayfa Hero fotoğrafı güncellendi.",
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

    // Smart URL change handlers: Auto parses HTML, BBCode, Markdown, and resolves ibb.co viewer links
    const handleAboutUrlChange = async (val: string) => {
        const parsed = parseImageUrl(val);
        setManualAboutUrl(parsed);

        if (isImgbbViewerUrl(parsed)) {
            setIsResolvingAbout(true);
            try {
                const resolved = await resolveImageUrl(parsed);
                if (resolved && resolved !== parsed) {
                    setManualAboutUrl(resolved);
                    toast({
                        title: "ImgBB Bağlantısı Algılandı",
                        description: "Doğrudan görsel bağlantısı otomatik olarak ayarlandı.",
                    });
                }
            } catch (err) {
                console.error("Error resolving ibb link:", err);
            } finally {
                setIsResolvingAbout(false);
            }
        }
    };

    const handleHeroUrlChange = async (val: string) => {
        const parsed = parseImageUrl(val);
        setManualHeroUrl(parsed);

        if (isImgbbViewerUrl(parsed)) {
            setIsResolvingHero(true);
            try {
                const resolved = await resolveImageUrl(parsed);
                if (resolved && resolved !== parsed) {
                    setManualHeroUrl(resolved);
                    toast({
                        title: "ImgBB Bağlantısı Algılandı",
                        description: "Doğrudan görsel bağlantısı otomatik olarak ayarlandı.",
                    });
                }
            } catch (err) {
                console.error("Error resolving ibb link:", err);
            } finally {
                setIsResolvingHero(false);
            }
        }
    };

    const handleGalleryUrlChange = async (val: string) => {
        const parsed = parseImageUrl(val);
        setManualGalleryUrl(parsed);

        if (isImgbbViewerUrl(parsed)) {
            setIsResolvingGallery(true);
            try {
                const resolved = await resolveImageUrl(parsed);
                if (resolved && resolved !== parsed) {
                    setManualGalleryUrl(resolved);
                    toast({
                        title: "ImgBB Bağlantısı Algılandı",
                        description: "Doğrudan görsel bağlantısı otomatik olarak ayarlandı.",
                    });
                }
            } catch (err) {
                console.error("Error resolving ibb link:", err);
            } finally {
                setIsResolvingGallery(false);
            }
        }
    };

    const handleSetManualAboutUrl = async () => {
        if (!manualAboutUrl.trim()) return;
        setSaving(true);
        try {
            let finalUrl = parseImageUrl(manualAboutUrl.trim());
            if (isImgbbViewerUrl(finalUrl)) {
                finalUrl = await resolveImageUrl(finalUrl);
            }

            await setDoc(
                doc(db, "settings", "media"),
                {
                    aboutImage: finalUrl,
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );

            await addExternalImageRecord(finalUrl, "Hakkımda Fotoğrafı");

            setAboutImage(finalUrl);
            setManualAboutUrl("");
            toast({ title: "Başarılı", description: "Hakkımda fotoğrafı güncellendi." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Hata", description: "Kaydedilemedi." });
        } finally {
            setSaving(false);
        }
    };

    const handleSetManualHeroUrl = async () => {
        if (!manualHeroUrl.trim()) return;
        setSaving(true);
        try {
            let finalUrl = parseImageUrl(manualHeroUrl.trim());
            if (isImgbbViewerUrl(finalUrl)) {
                finalUrl = await resolveImageUrl(finalUrl);
            }

            const heroDocRef = doc(db, "content", "hero");
            const heroDocSnap = await getDoc(heroDocRef);
            if (heroDocSnap.exists()) {
                await setDoc(heroDocRef, { ...heroDocSnap.data(), heroImage: finalUrl });
            } else {
                await setDoc(heroDocRef, { heroImage: finalUrl });
            }

            await addExternalImageRecord(finalUrl, "Hero Fotoğrafı");

            setHeroImage(finalUrl);
            setManualHeroUrl("");
            toast({ title: "Başarılı", description: "Hero fotoğrafı güncellendi." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Hata", description: "Kaydedilemedi." });
        } finally {
            setSaving(false);
        }
    };

    const handleAddGalleryImage = async () => {
        if (!manualGalleryUrl.trim()) return;
        setSaving(true);
        try {
            let finalUrl = parseImageUrl(manualGalleryUrl.trim());
            if (isImgbbViewerUrl(finalUrl)) {
                finalUrl = await resolveImageUrl(finalUrl);
            }

            await addExternalImageRecord(finalUrl, "Galeri Görseli");
            setManualGalleryUrl("");
            toast({ title: "Başarılı", description: "Görsel galeriye eklendi." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Hata", description: "Galeriye eklenemedi." });
        } finally {
            setSaving(false);
        }
    };

    const formatFileSize = (bytes: number, isExternal?: boolean) => {
        if (isExternal || bytes === 0) return "Harici Görsel";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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
                <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Yenile
                </Button>
            </div>

            {/* ImgBB Bilgilendirme ve Akıllı URL Yükleme Kartı */}
            <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Görsel Yükleme (ImgBB)
                            </CardTitle>
                            <CardDescription className="text-emerald-800/80 dark:text-emerald-300/80">
                                Fotoğraflarınızı ImgBB üzerinden ücretsiz yükleyip tek tıkla siteye ekleyebilirsiniz.
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-300 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200 shrink-0 font-medium"
                            asChild
                        >
                            <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                                <ExternalLink className="h-4 w-4" />
                                ImgBB.com'a Git
                            </a>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Hızlı Kullanım Rehberi */}
                    <div className="grid sm:grid-cols-3 gap-3 p-3.5 bg-white/80 dark:bg-card/80 border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg text-xs text-muted-foreground">
                        <div className="flex items-start gap-2.5">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                                1
                            </span>
                            <div>
                                <strong className="text-foreground block mb-0.5">Fotoğrafı Yükleyin</strong>
                                ImgBB.com'u açıp fotoğrafınızı yükleyin.
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                                2
                            </span>
                            <div>
                                <strong className="text-foreground block mb-0.5">Linki / Kodu Alın</strong>
                                Yükleme sonrası çıkan bağlantıyı veya kodu kopyalayın.
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                                3
                            </span>
                            <div>
                                <strong className="text-foreground block mb-0.5">Buraya Yapıştırın</strong>
                                Kutucuğa yapıştırıp Kaydet'e basın; fotoğraf doğrudan yüklenecektir.
                            </div>
                        </div>
                    </div>

                    {/* Akıllı URL Giriş Alanları */}
                    <div className="space-y-4">
                        {/* 1. Hakkımda Görseli URL */}
                        <div className="p-4 border rounded-lg bg-card space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="about-url" className="text-sm font-semibold flex items-center gap-1.5">
                                    <Link2 className="h-4 w-4 text-primary" />
                                    Hakkımda Bölümü Görseli
                                </Label>
                                {isResolvingAbout && (
                                    <span className="text-xs text-emerald-600 flex items-center gap-1 animate-pulse">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        ImgBB bağlantısı ayarlanıyor...
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    id="about-url"
                                    type="text"
                                    placeholder="ImgBB linkini veya kodunu buraya yapıştırın"
                                    value={manualAboutUrl}
                                    onChange={(e) => handleAboutUrlChange(e.target.value)}
                                    className="flex-1 font-mono text-xs sm:text-sm"
                                />
                                <Button
                                    onClick={handleSetManualAboutUrl}
                                    disabled={!manualAboutUrl.trim() || saving || isResolvingAbout}
                                    size="sm"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                                    Kaydet
                                </Button>
                            </div>
                            {/* Live Preview for About Image Input */}
                            {manualAboutUrl && (
                                <div className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-md border text-xs">
                                    <img
                                        src={manualAboutUrl}
                                        alt="Önizleme"
                                        className="w-12 h-12 rounded object-cover border shrink-0 bg-background"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-green-600 flex items-center gap-1">
                                            <Check className="h-3.5 w-3.5" /> Görsel Doğrulandı
                                        </p>
                                        <p className="text-muted-foreground truncate font-mono text-[11px]">{manualAboutUrl}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Hero Görseli URL */}
                        <div className="p-4 border rounded-lg bg-card space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="hero-url" className="text-sm font-semibold flex items-center gap-1.5">
                                    <Link2 className="h-4 w-4 text-primary" />
                                    Anasayfa (Hero) Görseli
                                </Label>
                                {isResolvingHero && (
                                    <span className="text-xs text-emerald-600 flex items-center gap-1 animate-pulse">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        ImgBB bağlantısı ayarlanıyor...
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    id="hero-url"
                                    type="text"
                                    placeholder="ImgBB linkini veya kodunu buraya yapıştırın"
                                    value={manualHeroUrl}
                                    onChange={(e) => handleHeroUrlChange(e.target.value)}
                                    className="flex-1 font-mono text-xs sm:text-sm"
                                />
                                <Button
                                    onClick={handleSetManualHeroUrl}
                                    disabled={!manualHeroUrl.trim() || saving || isResolvingHero}
                                    size="sm"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                                    Kaydet
                                </Button>
                            </div>
                            {/* Live Preview for Hero Image Input */}
                            {manualHeroUrl && (
                                <div className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-md border text-xs">
                                    <img
                                        src={manualHeroUrl}
                                        alt="Önizleme"
                                        className="w-12 h-12 rounded object-cover border shrink-0 bg-background"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-green-600 flex items-center gap-1">
                                            <Check className="h-3.5 w-3.5" /> Görsel Doğrulandı
                                        </p>
                                        <p className="text-muted-foreground truncate font-mono text-[11px]">{manualHeroUrl}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Galeriye Görsel Ekle (URL) */}
                        <div className="p-4 border rounded-lg bg-card space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="gallery-url" className="text-sm font-semibold flex items-center gap-1.5">
                                    <Plus className="h-4 w-4 text-primary" />
                                    Galeriye Yeni Görsel Ekle
                                </Label>
                                {isResolvingGallery && (
                                    <span className="text-xs text-emerald-600 flex items-center gap-1 animate-pulse">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        ImgBB bağlantısı ayarlanıyor...
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    id="gallery-url"
                                    type="text"
                                    placeholder="ImgBB linkini veya kodunu buraya yapıştırın"
                                    value={manualGalleryUrl}
                                    onChange={(e) => handleGalleryUrlChange(e.target.value)}
                                    className="flex-1 font-mono text-xs sm:text-sm"
                                />
                                <Button
                                    onClick={handleAddGalleryImage}
                                    disabled={!manualGalleryUrl.trim() || saving || isResolvingGallery}
                                    size="sm"
                                    variant="secondary"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
                                    Galeriye Ekle
                                </Button>
                            </div>
                            {manualGalleryUrl && (
                                <div className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-md border text-xs">
                                    <img
                                        src={manualGalleryUrl}
                                        alt="Önizleme"
                                        className="w-12 h-12 rounded object-cover border shrink-0 bg-background"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-green-600 flex items-center gap-1">
                                            <Check className="h-3.5 w-3.5" /> Görsel Doğrulandı
                                        </p>
                                        <p className="text-muted-foreground truncate font-mono text-[11px]">{manualGalleryUrl}</p>
                                    </div>
                                </div>
                            )}
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
                    <CardDescription>Sitedeki Hakkımda bölümünde görünen aktif fotoğraf</CardDescription>
                </CardHeader>
                <CardContent>
                    {aboutImage ? (
                        <div className="flex items-start gap-4">
                            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                                <img src={aboutImage} alt="Hakkımda Fotoğrafı" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Bu fotoğraf şu an sitede aktif olarak görünüyor.</p>
                                <p className="text-sm text-muted-foreground">
                                    Değiştirmek için yukarıdaki ImgBB alanını kullanabilir veya aşağıdaki galeriden başka bir fotoğraf
                                    seçebilirsiniz.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Fotoğraf Seçilmedi</p>
                                <p className="text-sm text-muted-foreground">
                                    Yukarıdan ImgBB linki yapıştırarak veya galeriden seçerek Hakkımda bölümüne ekleyin.
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
                        Hero (Anasayfa) Bölümü Fotoğrafı
                    </CardTitle>
                    <CardDescription>Anasayfanın en üstünde görünen büyük fotoğraf</CardDescription>
                </CardHeader>
                <CardContent>
                    {heroImage ? (
                        <div className="flex items-start gap-4">
                            <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                                <img src={heroImage} alt="Hero Fotoğrafı" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-500 drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Bu fotoğraf şu an anasayfada aktif olarak görünüyor.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Fotoğraf Seçilmedi</p>
                                <p className="text-sm text-muted-foreground">Varsayılan fotoğraf kullanılıyor.</p>
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
                            <span className="ml-2 text-sm font-normal text-muted-foreground">({allImages.length} görsel)</span>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Kayıtlı tüm görseller. Bir görsele tıklayarak önizleyin veya Hakkımda / Hero bölümüne atayın.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {allImages.map((image) => (
                                <div
                                    key={image.url}
                                    className={`
                                        group relative aspect-square rounded-lg overflow-hidden
                                        border-2 transition-all duration-200 cursor-pointer
                                        ${
                                            aboutImage === image.url
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-border hover:border-primary/50"
                                        }
                                    `}
                                    onClick={() => setSelectedPreview(image)}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />

                                    {/* Source badge */}
                                    {image.isExternal && (
                                        <div className="absolute bottom-2 left-2 z-10">
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-background/80 backdrop-blur-sm shadow">
                                                ImgBB
                                            </Badge>
                                        </div>
                                    )}

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
                                Yukarıdaki alandan ImgBB linki yapıştırarak ilk görselinizi ekleyin.
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
                        <DialogDescription>Görsel detayları ve işlemler</DialogDescription>
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
                                    <span>{formatFileSize(selectedPreview.size, selectedPreview.isExternal)}</span>
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
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
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
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
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
                                    ⚠️ Bu görsel şu an Hakkımda bölümünde kullanılıyor. Silindikten sonra varsayılan görsel görüntülenecektir.
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
        </div>
    );
}
