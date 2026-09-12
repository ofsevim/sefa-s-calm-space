import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseImageUrl, resolveImageUrl, isImgbbViewerUrl } from "@/lib/imageUtils";

interface HeroContent {
    title: string;
    titleHighlight: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    heroImage: string;
}

interface AboutContent {
    badge: string;
    title: string;
    titleHighlight: string;
    paragraph1: string;
    paragraph2: string;
}

export default function ContentManagement() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isResolvingHero, setIsResolvingHero] = useState(false);

    // Hero Content State
    const [heroContent, setHeroContent] = useState<HeroContent>({
        title: "Tek Başına Taşımak",
        titleHighlight: "Zorunda Değilsiniz.",
        description: "Herkes zaman zaman desteğe ihtiyaç duyar. İç dünyanızdaki karmaşayı netliğe kavuşturmak ve daha huzurlu bir zihne ulaşmak sandığınızdan daha yakın olabilir.",
        primaryButtonText: "Randevu Oluştur",
        secondaryButtonText: "Hizmetleri İncele",
        heroImage: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=1000&auto=format&fit=crop",
    });

    // About Content State
    const [aboutContent, setAboutContent] = useState<AboutContent>({
        badge: "Hakkımda",
        title: "Merhaba, Ben",
        titleHighlight: "Sefa Sevim",
        paragraph1: "Hayatın gürültüsü içinde bazen kendi sesimizi duymakta zorlanırız. Bir PDR uzmanı olarak amacım, o sesi yeniden keşfetmenize rehberlik etmektir.",
        paragraph2: "Bilimsel yöntemlerin ışığında; tüm duygularınızı özgürce ifade edebileceğiniz güvenli bir limandasınız. Unutmayın; iyileşmek, yargılanmadığınızı hissettiğiniz yerde başlar.",
    });

    // Handle Hero Image change with smart ImgBB / HTML parser & resolver
    const handleHeroImageChange = async (val: string) => {
        const parsed = parseImageUrl(val);
        setHeroContent((prev) => ({ ...prev, heroImage: parsed }));

        if (isImgbbViewerUrl(parsed)) {
            setIsResolvingHero(true);
            try {
                const resolved = await resolveImageUrl(parsed);
                if (resolved && resolved !== parsed) {
                    setHeroContent((prev) => ({ ...prev, heroImage: resolved }));
                    toast.success("ImgBB doğrudan görsel bağlantısı ayarlandı");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsResolvingHero(false);
            }
        }
    };

    // Fetch content from Firestore
    useEffect(() => {
        const fetchContent = async () => {
            try {
                setFetching(true);

                // Fetch Hero and About Content in parallel
                const [heroDoc, aboutDoc] = await Promise.all([
                    getDoc(doc(db, "content", "hero")),
                    getDoc(doc(db, "content", "about")),
                ]);
                if (heroDoc.exists()) {
                    setHeroContent(heroDoc.data() as HeroContent);
                }
                if (aboutDoc.exists()) {
                    setAboutContent(aboutDoc.data() as AboutContent);
                }
            } catch (error) {
                console.error("İçerik yüklenirken hata:", error);
                toast.error("İçerik yüklenemedi");
            } finally {
                setFetching(false);
            }
        };

        fetchContent();
    }, []);

    // Save Hero Content to Firestore
    const saveHeroContent = async () => {
        setLoading(true);
        try {
            let finalImage = parseImageUrl(heroContent.heroImage);
            if (isImgbbViewerUrl(finalImage)) {
                finalImage = await resolveImageUrl(finalImage);
            }
            await setDoc(doc(db, "content", "hero"), { ...heroContent, heroImage: finalImage });
            toast.success("Hero içeriği başarıyla kaydedildi!");
        } catch (error) {
            console.error("Hero içerik kaydetme hatası:", error);
            toast.error("Kaydetme işlemi başarısız oldu");
        } finally {
            setLoading(false);
        }
    };

    // Save About Content to Firestore
    const saveAboutContent = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, "content", "about"), aboutContent);
            toast.success("Hakkımda içeriği başarıyla kaydedildi!");
        } catch (error) {
            console.error("Hakkımda içerik kaydetme hatası:", error);
            toast.error("Kaydetme işlemi başarısız oldu");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                    İçerik Yönetimi
                </h1>
                <p className="text-muted-foreground">
                    Anasayfa ve Hakkımda bölümlerinin içeriklerini buradan düzenleyebilirsiniz.
                </p>
            </motion.div>

            {/* Hero Section Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-primary" />
                            <CardTitle>Hero Bölümü (Anasayfa)</CardTitle>
                        </div>
                        <CardDescription>
                            Anasayfanın ilk görünen bölümündeki yazıları düzenleyin
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hero-title">Ana Başlık</Label>
                                <Input
                                    id="hero-title"
                                    value={heroContent.title}
                                    onChange={(e) =>
                                        setHeroContent({ ...heroContent, title: e.target.value })
                                    }
                                    placeholder="Tek Başına Taşımak"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hero-highlight">Vurgulu Kısım</Label>
                                <Input
                                    id="hero-highlight"
                                    value={heroContent.titleHighlight}
                                    onChange={(e) =>
                                        setHeroContent({ ...heroContent, titleHighlight: e.target.value })
                                    }
                                    placeholder="Zorunda Değilsiniz."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero-description">Açıklama Metni</Label>
                            <Textarea
                                id="hero-description"
                                value={heroContent.description}
                                onChange={(e) =>
                                    setHeroContent({ ...heroContent, description: e.target.value })
                                }
                                rows={4}
                                placeholder="Herkes zaman zaman desteğe ihtiyaç duyar..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hero-btn1">Birinci Buton Yazısı</Label>
                                <Input
                                    id="hero-btn1"
                                    value={heroContent.primaryButtonText}
                                    onChange={(e) =>
                                        setHeroContent({ ...heroContent, primaryButtonText: e.target.value })
                                    }
                                    placeholder="Randevu Oluştur"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hero-btn2">İkinci Buton Yazısı</Label>
                                <Input
                                    id="hero-btn2"
                                    value={heroContent.secondaryButtonText}
                                    onChange={(e) =>
                                        setHeroContent({ ...heroContent, secondaryButtonText: e.target.value })
                                    }
                                    placeholder="Hizmetleri İncele"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="hero-image">Hero Görseli URL (ImgBB doğrudan link, HTML kodu veya sayfa linki)</Label>
                                {isResolvingHero && (
                                    <span className="text-xs text-emerald-600 flex items-center gap-1 animate-pulse font-medium">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        ImgBB bağlantısı ayarlanıyor...
                                    </span>
                                )}
                            </div>
                            <Input
                                id="hero-image"
                                value={heroContent.heroImage}
                                onChange={(e) => handleHeroImageChange(e.target.value)}
                                placeholder="https://i.ibb.co/... veya ibb.co linki ya da HTML kodu"
                                className="font-mono text-xs sm:text-sm"
                            />
                            {heroContent.heroImage && (
                                <div className="flex items-center gap-3 p-2.5 bg-muted/40 rounded border text-xs mt-2">
                                    <img
                                        src={heroContent.heroImage}
                                        alt="Hero Önizleme"
                                        className="w-12 h-12 rounded object-cover border shrink-0 bg-background"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-green-600">✓ Görsel bağlantısı hazır</p>
                                        <p className="text-muted-foreground truncate font-mono text-[11px]">{heroContent.heroImage}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button onClick={saveHeroContent} disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Hero İçeriğini Kaydet
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* About Section Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle>Hakkımda Bölümü</CardTitle>
                        </div>
                        <CardDescription>
                            Hakkımda sayfasındaki içeriği düzenleyin
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="about-badge">Rozet Yazısı</Label>
                                <Input
                                    id="about-badge"
                                    value={aboutContent.badge}
                                    onChange={(e) =>
                                        setAboutContent({ ...aboutContent, badge: e.target.value })
                                    }
                                    placeholder="Hakkımda"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="about-title">Başlık</Label>
                                <Input
                                    id="about-title"
                                    value={aboutContent.title}
                                    onChange={(e) =>
                                        setAboutContent({ ...aboutContent, title: e.target.value })
                                    }
                                    placeholder="Merhaba, Ben"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="about-highlight">İsim (Vurgulu)</Label>
                                <Input
                                    id="about-highlight"
                                    value={aboutContent.titleHighlight}
                                    onChange={(e) =>
                                        setAboutContent({ ...aboutContent, titleHighlight: e.target.value })
                                    }
                                    placeholder="Sefa Sevim"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="about-p1">Birinci Paragraf</Label>
                            <Textarea
                                id="about-p1"
                                value={aboutContent.paragraph1}
                                onChange={(e) =>
                                    setAboutContent({ ...aboutContent, paragraph1: e.target.value })
                                }
                                rows={3}
                                placeholder="Hayatın gürültüsü içinde..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="about-p2">İkinci Paragraf</Label>
                            <Textarea
                                id="about-p2"
                                value={aboutContent.paragraph2}
                                onChange={(e) =>
                                    setAboutContent({ ...aboutContent, paragraph2: e.target.value })
                                }
                                rows={3}
                                placeholder="Bilimsel yöntemlerin ışığında..."
                            />
                        </div>

                        <Button onClick={saveAboutContent} disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Hakkımda İçeriğini Kaydet
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
