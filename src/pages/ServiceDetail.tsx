import { useEffect, useState, type ElementType } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slugify";
import { getServiceContent } from "@/data/serviceContent";
import { services as staticServices } from "@/data/content";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface Service {
    title: string;
    description: string;
    icon: string | ElementType;
    color: string;
    iconColor: string;
}

export default function ServiceDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const initialService = staticServices.find((item) => slugify(item.title) === slug) as Service | undefined;
    const [service, setService] = useState<Service | null>(initialService ?? null);
    const [loading, setLoading] = useState(!initialService);
    const content = getServiceContent(slug);

    useEffect(() => {
        let active = true;
        const staticService = staticServices.find((item) => slugify(item.title) === slug) as Service | undefined;

        const fetchService = async () => {
            try {
                const snapshot = await getDoc(doc(db, "settings", "services"));
                const remoteServices = snapshot.exists() && Array.isArray(snapshot.data().items)
                    ? snapshot.data().items as Service[]
                    : [];
                const remoteService = remoteServices.find((item) => slugify(item.title) === slug);
                if (active) setService(remoteService ?? staticService ?? null);
            } catch (error) {
                console.error("Error fetching service:", error);
                if (active) setService(staticService ?? null);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchService();
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        return () => { active = false; };
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background" role="status">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Hizmet bilgileri yükleniyor...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <>
                <Helmet><title>Hizmet Bulunamadı | Sefa Sevim</title><meta name="robots" content="noindex" /></Helmet>
                <Navbar />
                <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                    <h1 className="text-2xl font-bold mb-4">Hizmet Bulunamadı</h1>
                    <Button onClick={() => navigate("/")} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön</Button>
                </main>
                <Footer />
            </>
        );
    }

    const IconComponent = service.icon;
    const seoTitle = content?.seo.title ?? `${service.title} | Psk. Dan. Sefa Sevim`;
    const seoDescription = content?.seo.description ?? service.description;
    const canonical = content?.seo.canonical ?? `https://sefasevim.com/hizmet/${slugify(service.title)}`;
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.title,
        description: seoDescription,
        provider: { "@type": "Person", name: "Sefa Sevim", url: "https://sefasevim.com" },
        areaServed: "TR",
        url: canonical,
    };

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                {content?.seo.keywords && <meta name="keywords" content={content.seo.keywords} />}
                <link rel="canonical" href={canonical} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonical} />
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>
            <Navbar />
            <main className="min-h-screen bg-background pt-20 overflow-x-clip">
                <section className="relative bg-secondary py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
                    <div className="relative max-w-4xl mx-auto text-center">
                        <Button onClick={() => navigate("/#hizmetler")} variant="ghost" className="sm:absolute left-0 top-0 mb-6 sm:mb-0 text-secondary-foreground/80 hover:text-secondary-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Hizmetlere Dön
                        </Button>
                        <div className={`mx-auto w-20 h-20 rounded-2xl ${service.color} flex items-center justify-center mb-8 shadow-lg`}>
                            {typeof IconComponent === "string"
                                ? <DynamicIcon name={IconComponent} className={`w-10 h-10 ${service.iconColor}`} />
                                : <IconComponent className={`w-10 h-10 ${service.iconColor}`} />}
                        </div>
                        <span className="text-sm font-medium text-primary-foreground/80">{content?.hero.badge ?? "Psikolojik Danışmanlık"}</span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-secondary-foreground mt-3 mb-6 break-words">{service.title}</h1>
                        <p className="text-lg sm:text-xl text-secondary-foreground/80 max-w-2xl mx-auto leading-relaxed">{service.description}</p>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                    <div className="bg-card rounded-3xl p-6 sm:p-12 shadow-card border border-border/50">
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{content?.intro ?? `${service.title} süreci kişisel ihtiyaçlarınıza göre planlanır.`}</p>
                    </div>

                    {content && (
                        <>
                            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="bg-card rounded-3xl p-6 sm:p-8 border">
                                    <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-5">{content.whenNeeded.title}</h2>
                                    <ul className="space-y-3">{content.whenNeeded.items.map((item) => <li key={item} className="flex gap-3 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />{item}</li>)}</ul>
                                </div>
                                <div className="bg-card rounded-3xl p-6 sm:p-8 border">
                                    <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-5">{content.whoCanBenefit.title}</h2>
                                    <ul className="space-y-3">{content.whoCanBenefit.groups.map((item) => <li key={item} className="flex gap-3 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />{item}</li>)}</ul>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-center mb-8">{content.process.title}</h2>
                                <div className="grid md:grid-cols-3 gap-6">{content.process.steps.map((step) => <div key={step.number} className="bg-card rounded-2xl p-6 border"><span className="text-primary font-bold">{step.number}</span><h3 className="font-semibold text-lg mt-2 mb-2">{step.title}</h3><p className="text-muted-foreground">{step.description}</p></div>)}</div>
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-center mb-8">Sık Sorulan Sorular</h2>
                                <div className="space-y-4">{content.faqs.map((faq) => <div key={faq.question} className="bg-card rounded-2xl p-6 border"><h3 className="font-semibold mb-2">{faq.question}</h3><p className="text-muted-foreground">{faq.answer}</p></div>)}</div>
                            </div>
                        </>
                    )}

                    <div className="rounded-3xl bg-gradient-sage p-6 sm:p-12 text-center text-primary-foreground">
                        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3">{content?.cta.title ?? "İlk adımı birlikte planlayalım"}</h2>
                        <p className="mb-7 opacity-85 text-sm sm:text-base">{content?.cta.description ?? "Randevu talebinizi iletin; uygun zaman için sizinle iletişime geçelim."}</p>
                        <Button size="lg" variant="glass" onClick={() => navigate("/#iletisim")}><Calendar className="w-5 h-5 mr-2" />{content?.cta.buttonText ?? "Randevu Talebi Oluştur"}</Button>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
