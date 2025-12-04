import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { services as staticServices } from "@/data/content";

interface Service {
    title: string;
    description: string;
    icon: string;
    color: string;
    iconColor: string;
}

export default function ServiceDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            setLoading(true);
            try {
                // First try to find in Firestore
                const docRef = doc(db, "settings", "services");
                const docSnap = await getDoc(docRef);

                let foundService = null;

                if (docSnap.exists() && docSnap.data().items) {
                    const services = docSnap.data().items as Service[];
                    // Simple slugify: lowercase and replace spaces with dashes
                    foundService = services.find(s =>
                        s.title.toLowerCase().replace(/\s+/g, '-') === slug
                    );
                }

                // If not found in Firestore, check static data
                if (!foundService) {
                    foundService = staticServices.find(s =>
                        s.title.toLowerCase().replace(/\s+/g, '-') === slug
                    ) as Service | null;
                }

                setService(foundService || null);
            } catch (error) {
                console.error("Error fetching service:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchService();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <h1 className="text-2xl font-bold mb-4">Hizmet Bulunamadı</h1>
                <Button onClick={() => navigate("/")} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-secondary py-20 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                </div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <Button
                        onClick={() => navigate("/")}
                        variant="ghost"
                        className="absolute left-0 top-0 text-secondary-foreground/60 hover:text-secondary-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Geri
                    </Button>

                    <div className={`mx-auto w-20 h-20 rounded-2xl ${service.color} flex items-center justify-center mb-8 shadow-lg`}>
                        <DynamicIcon name={service.icon} className={`w-10 h-10 ${service.iconColor}`} />
                    </div>

                    <h1 className="text-4xl font-heading font-bold text-secondary-foreground mb-6">
                        {service.title}
                    </h1>
                    <p className="text-xl text-secondary-foreground/80 max-w-2xl mx-auto leading-relaxed">
                        {service.description}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="bg-card rounded-3xl p-8 sm:p-12 shadow-card border border-border/50">
                    <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                        {service.title === "Bireysel Danışmanlık" && (
                            <>
                                <p>
                                    Bireysel danışmanlık, kişisel gelişim ve ruh sağlığı için özel olarak tasarlanmış birebir destek sürecidir.
                                    Bu süreçte, yaşadığınız zorlukları anlamak, güçlü yönlerinizi keşfetmek ve hedeflerinize ulaşmak için birlikte çalışırız.
                                </p>
                                <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Bireysel Danışmanlık Neleri Kapsar?</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Özgüven ve benlik saygısı geliştirme</li>
                                    <li>İlişki sorunları ve iletişim becerileri</li>
                                    <li>Stres ve kaygı yönetimi</li>
                                    <li>Yaşam geçişleri ve değişim süreçleri</li>
                                    <li>Kişisel hedef belirleme ve motivasyon</li>
                                </ul>
                            </>
                        )}

                        {service.title === "Ergen Danışmanlığı" && (
                            <>
                                <p>
                                    Ergenlik dönemi, fiziksel, duygusal ve sosyal değişimlerin yoğun yaşandığı kritik bir dönemdir.
                                    Ergen danışmanlığı, gençlerin bu dönemi sağlıklı bir şekilde geçirmelerine yardımcı olur.
                                </p>
                                <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Ergen Danışmanlığında Odaklandığımız Konular</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Kimlik gelişimi ve benlik keşfi</li>
                                    <li>Akran ilişkileri ve sosyal uyum</li>
                                    <li>Aile içi iletişim sorunları</li>
                                    <li>Akademik başarı ve motivasyon</li>
                                    <li>Duygusal düzenleme becerileri</li>
                                </ul>
                            </>
                        )}

                        {service.title === "Sınav Kaygısı" && (
                            <>
                                <p>
                                    Sınav kaygısı, performansı olumsuz etkileyen ve birçok öğrencinin yaşadığı yaygın bir sorundur.
                                    Bu süreçte, kaygıyı yönetmek ve sınav performansını artırmak için etkili stratejiler geliştiririz.
                                </p>
                                <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Sınav Kaygısı Danışmanlığı Nasıl Yardımcı Olur?</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Kaygı belirtilerini tanıma ve yönetme</li>
                                    <li>Etkili çalışma teknikleri ve zaman yönetimi</li>
                                    <li>Gevşeme ve nefes egzersizleri</li>
                                    <li>Olumsuz düşünceleri yeniden yapılandırma</li>
                                    <li>Özgüven ve motivasyon artırma</li>
                                </ul>
                            </>
                        )}

                        {service.title === "Kariyer Danışmanlığı" && (
                            <>
                                <p>
                                    Kariyer danışmanlığı, meslek seçimi, kariyer planlaması ve iş hayatındaki zorlukları aşmak için profesyonel destek sunar.
                                    Yeteneklerinizi, ilgi alanlarınızı ve değerlerinizi keşfederek size en uygun kariyer yolunu belirlemenize yardımcı oluruz.
                                </p>
                                <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Kariyer Danışmanlığı Süreci</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Kişilik ve yetenek değerlendirmesi</li>
                                    <li>Meslek seçimi ve kariyer planlama</li>
                                    <li>İş arama stratejileri ve mülakat hazırlığı</li>
                                    <li>İş yerinde uyum ve performans artırma</li>
                                    <li>Kariyer değişimi ve geçiş süreçleri</li>
                                </ul>
                            </>
                        )}

                        {service.title === "Online Terapi" && (
                            <>
                                <p>
                                    Online terapi, evinizin konforunda, güvenli ve etkili psikolojik danışmanlık almanızı sağlar.
                                    Teknolojinin sunduğu imkanlarla, coğrafi kısıtlamalar olmadan profesyonel desteğe erişebilirsiniz.
                                </p>
                                <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Online Terapinin Avantajları</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Zaman ve mekan esnekliği</li>
                                    <li>Tanıdık bir ortamda rahat hissetme</li>
                                    <li>Ulaşım ve zaman tasarrufu</li>
                                    <li>Gizlilik ve mahremiyet</li>
                                    <li>Düzenli seans sürekliliği</li>
                                </ul>
                            </>
                        )}

                        {!["Bireysel Danışmanlık", "Ergen Danışmanlığı", "Sınav Kaygısı", "Kariyer Danışmanlığı", "Online Terapi"].includes(service.title) && (
                            <p>
                                {service.title} hizmetimiz hakkında detaylı bilgi almak ve kişisel ihtiyaçlarınıza özel bir planlama yapmak için bizimle iletişime geçebilirsiniz.
                                Her bireyin yolculuğu kendine özgüdür ve biz bu yolculukta size profesyonel rehberlik sunmak için buradayız.
                            </p>
                        )}
                    </div>

                    <div className="mt-12 flex justify-center">
                        <Button size="lg" className="gap-2" onClick={() => {
                            const element = document.querySelector("#iletisim");
                            if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                            } else {
                                navigate("/#iletisim");
                            }
                        }}>
                            <Calendar className="w-5 h-5" />
                            Randevu Oluştur
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
