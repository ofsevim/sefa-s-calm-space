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
                    <div className="prose prose-lg max-w-none text-muted-foreground">
                        <p>
                            {service.title} hizmetimiz hakkında detaylı bilgi almak ve kişisel ihtiyaçlarınıza özel bir planlama yapmak için bizimle iletişime geçebilirsiniz.
                        </p>
                        <p>
                            Her bireyin yolculuğu kendine özgüdür ve biz bu yolculukta size profesyonel rehberlik sunmak için buradayız.
                        </p>
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
