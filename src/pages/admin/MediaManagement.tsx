import { useState, useEffect, useCallback } from "react";
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
    CheckCircle2,
    RefreshCw,
    ExternalLink,
    Sparkles,
    Link2,
    Check,
    RotateCcw
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { parseImageUrl, resolveImageUrl, isImgbbViewerUrl } from "@/lib/imageUtils";

export default function MediaManagement() {
    const [savingAbout, setSavingAbout] = useState(false);
    const [savingHero, setSavingHero] = useState(false);
    const [loading, setLoading] = useState(true);

    const [aboutImage, setAboutImage] = useState<string>("");
    const [heroImage, setHeroImage] = useState<string>("");

    const [manualAboutUrl, setManualAboutUrl] = useState<string>("");
    const [manualHeroUrl, setManualHeroUrl] = useState<string>("");

    const [isResolvingAbout, setIsResolvingAbout] = useState(false);
    const [isResolvingHero, setIsResolvingHero] = useState(false);

    const { toast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Load current about and hero images in parallel
            const docRef = doc(db, "settings", "media");
            const heroDocRef = doc(db, "content", "hero");

            const [docSnap, heroDocSnap] = await Promise.all([
                getDoc(docRef),
                getDoc(heroDocRef),
            ]);

            if (docSnap.exists() && docSnap.data().aboutImage) {
                setAboutImage(docSnap.data().aboutImage);
            } else {
                setAboutImage("");
            }

            if (heroDocSnap.exists() && heroDocSnap.data().heroImage) {
                setHeroImage(heroDocSnap.data().heroImage);
            } else {
                setHeroImage("");
            }
        } catch (error) {
            console.error("Error loading images:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Mevcut görseller yüklenirken bir sorun oluştu.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

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

    const handleSaveAboutImage = async () => {
        if (!manualAboutUrl.trim()) return;
        setSavingAbout(true);
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

            setAboutImage(finalUrl);
            setManualAboutUrl("");
            toast({
                title: "Başarılı 🎉",
                description: "Hakkımda bölümü fotoğrafı güncellendi ve sitede yayına alındı.",
            });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Hata", description: "Fotoğraf kaydedilemedi." });
        } finally {
            setSavingAbout(false);
        }
    };

    const handleSaveHeroImage = async () => {
        if (!manualHeroUrl.trim()) return;
        setSavingHero(true);
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

            setHeroImage(finalUrl);
            setManualHeroUrl("");
            toast({
                title: "Başarılı 🎉",
                description: "Anasayfa (Hero) fotoğrafı güncellendi ve sitede yayına alındı.",
            });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Hata", description: "Fotoğraf kaydedilemedi." });
        } finally {
            setSavingHero(false);
        }
    };

    const handleResetAboutImage = async () => {
        setSavingAbout(true);
        try {
            await setDoc(
                doc(db, "settings", "media"),
                {
                    aboutImage: "",
                    updatedAt: new Date().toISOString(),
                },
                { merge: true }
            );
            setAboutImage("");
            toast({
                title: "Varsayılana Sıfırlandı",
                description: "Hakkımda fotoğrafı sitenin varsayılan görseline döndürüldü.",
            });
        } catch (err) {
            toast({ variant: "destructive", title: "Hata", description: "Sıfırlanamadı." });
        } finally {
            setSavingAbout(false);
        }
    };

    const handleResetHeroImage = async () => {
        setSavingHero(true);
        try {
            const heroDocRef = doc(db, "content", "hero");
            const heroDocSnap = await getDoc(heroDocRef);
            if (heroDocSnap.exists()) {
                await setDoc(heroDocRef, { ...heroDocSnap.data(), heroImage: "" });
            }
            setHeroImage("");
            toast({
                title: "Varsayılana Sıfırlandı",
                description: "Anasayfa fotoğrafı sitenin varsayılan görseline döndürüldü.",
            });
        } catch (err) {
            toast({ variant: "destructive", title: "Hata", description: "Sıfırlanamadı." });
        } finally {
            setSavingHero(false);
        }
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
        <div className="space-y-6 max-w-5xl">
            {/* Üst Başlık */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Görsel Yönetimi</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Sitenizin Anasayfa (Hero) ve Hakkımda bölümlerindeki fotoğrafları güncelleyin.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="self-start sm:self-auto shrink-0">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Yenile
                </Button>
            </div>

            {/* ImgBB Rehber Kartı */}
            <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100 text-lg">
                                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Fotoğraf Nasıl Yüklenir? (ImgBB)
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
                <CardContent>
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
                                <strong className="text-foreground block mb-0.5">Linki / Kodu Kopyalayın</strong>
                                Yükleme sonrası çıkan bağlantıyı veya kodu kopyalayın.
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                                3
                            </span>
                            <div>
                                <strong className="text-foreground block mb-0.5">Buraya Yapıştırın</strong>
                                Aşağıdaki ilgili alana yapıştırıp "Kaydet"e basın; fotoğraf anında yayına girer.
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 1. ANASAYFA (HERO) FOTOĞRAFI KARTI */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                                1. Anasayfa (Hero) Fotoğrafı
                            </CardTitle>
                            <CardDescription>
                                Sitenin en üstünde, karşılama metninin yanındaki ana vitrin görseli.
                            </CardDescription>
                        </div>
                        <Badge variant={heroImage ? "default" : "secondary"} className="self-start sm:self-auto shrink-0">
                            {heroImage ? "Özel Görsel Yayında" : "Varsayılan Görsel"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid md:grid-cols-3 gap-6 items-start">
                        {/* Sol: Mevcut Aktif Fotoğraf */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Şu Anda Sitede Yayında Olan:</Label>
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/30 shadow-sm flex items-center justify-center">
                                {heroImage ? (
                                    <>
                                        <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-1 opacity-50" />
                                        <p className="text-xs text-muted-foreground">Varsayılan fotoğraf aktif</p>
                                    </div>
                                )}
                            </div>
                            {heroImage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetHeroImage}
                                    disabled={savingHero}
                                    className="text-xs text-muted-foreground hover:text-destructive w-full"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Varsayılana Sıfırla
                                </Button>
                            )}
                        </div>

                        {/* Sağ: Yeni Fotoğraf Yükleme Formu */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="hero-url" className="text-sm font-semibold flex items-center gap-1.5">
                                        <Link2 className="h-4 w-4 text-primary" />
                                        Yeni Fotoğraf Linki veya Kodu Yapıştırın
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
                                        onClick={handleSaveHeroImage}
                                        disabled={!manualHeroUrl.trim() || savingHero || isResolvingHero}
                                        className="gap-1.5 shrink-0"
                                    >
                                        {savingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Kaydet
                                    </Button>
                                </div>
                            </div>

                            {/* Canlı Önizleme */}
                            {manualHeroUrl && (
                                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border text-xs">
                                    <img
                                        src={manualHeroUrl}
                                        alt="Önizleme"
                                        className="w-16 h-12 rounded object-cover border shrink-0 bg-background"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-emerald-600 flex items-center gap-1">
                                            <Check className="h-3.5 w-3.5" /> Görsel Doğrulandı
                                        </p>
                                        <p className="text-muted-foreground truncate font-mono text-[11px] mt-0.5">{manualHeroUrl}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. HAKKIMDA FOTOĞRAFI KARTI */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                                2. Hakkımda Bölümü Portre Fotoğrafı
                            </CardTitle>
                            <CardDescription>
                                Sitedeki "Ben Kimim? / Psikolojik Danışman Sefa Sevim" bölümündeki portre fotoğrafı.
                            </CardDescription>
                        </div>
                        <Badge variant={aboutImage ? "default" : "secondary"} className="self-start sm:self-auto shrink-0">
                            {aboutImage ? "Özel Görsel Yayında" : "Varsayılan Görsel"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid md:grid-cols-3 gap-6 items-start">
                        {/* Sol: Mevcut Aktif Fotoğraf */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Şu Anda Sitede Yayında Olan:</Label>
                            <div className="relative aspect-square w-full max-w-[200px] rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/30 shadow-sm flex items-center justify-center">
                                {aboutImage ? (
                                    <>
                                        <img src={aboutImage} alt="Hakkımda" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-1 opacity-50" />
                                        <p className="text-xs text-muted-foreground">Varsayılan fotoğraf aktif</p>
                                    </div>
                                )}
                            </div>
                            {aboutImage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetAboutImage}
                                    disabled={savingAbout}
                                    className="text-xs text-muted-foreground hover:text-destructive w-full max-w-[200px]"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Varsayılana Sıfırla
                                </Button>
                            )}
                        </div>

                        {/* Sağ: Yeni Fotoğraf Yükleme Formu */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="about-url" className="text-sm font-semibold flex items-center gap-1.5">
                                        <Link2 className="h-4 w-4 text-primary" />
                                        Yeni Fotoğraf Linki veya Kodu Yapıştırın
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
                                        onClick={handleSaveAboutImage}
                                        disabled={!manualAboutUrl.trim() || savingAbout || isResolvingAbout}
                                        className="gap-1.5 shrink-0"
                                    >
                                        {savingAbout ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Kaydet
                                    </Button>
                                </div>
                            </div>

                            {/* Canlı Önizleme */}
                            {manualAboutUrl && (
                                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border text-xs">
                                    <img
                                        src={manualAboutUrl}
                                        alt="Önizleme"
                                        className="w-14 h-14 rounded-full object-cover border shrink-0 bg-background"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-emerald-600 flex items-center gap-1">
                                            <Check className="h-3.5 w-3.5" /> Görsel Doğrulandı
                                        </p>
                                        <p className="text-muted-foreground truncate font-mono text-[11px] mt-0.5">{manualAboutUrl}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
