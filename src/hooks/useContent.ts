import { useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface HeroContent {
    title: string;
    titleHighlight: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
}

interface AboutContent {
    badge: string;
    title: string;
    titleHighlight: string;
    paragraph1: string;
    paragraph2: string;
}

const defaultHeroContent: HeroContent = {
    title: "Tek Başına Taşımak",
    titleHighlight: "Zorunda Değilsiniz.",
    description:
        "Herkes zaman zaman desteğe ihtiyaç duyar. İç dünyanızdaki karmaşayı netliğe kavuşturmak ve daha huzurlu bir zihne ulaşmak sandığınızdan daha yakın olabilir.",
    primaryButtonText: "Randevu Oluştur",
    secondaryButtonText: "Hizmetleri İncele",
};

const defaultAboutContent: AboutContent = {
    badge: "Hakkımda",
    title: " Merhaba, Ben",
    titleHighlight: "Sefa Sevim",
    paragraph1:
        "Hayatın gürültüsü içinde bazen kendi sesimizi duymakta zorlanırız. Bir PDR uzmanı olarak amacım, o sesi yeniden keşfetmenize rehberlik etmektir.",
    paragraph2:
        "Bilimsel yöntemlerin ışığında; tüm duygularınızı özgürce ifade edebileceğiniz güvenli bir limandasınız. Unutmayın; iyileşmek, yargılanmadığınızı hissettiğiniz yerde başlar.",
};

export function useHeroContent() {
    const [content, setContent] = useState<HeroContent>(defaultHeroContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "content", "hero"),
            (doc) => {
                if (doc.exists()) {
                    setContent(doc.data() as HeroContent);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Hero content fetch error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { content, loading };
}

export function useAboutContent() {
    const [content, setContent] = useState<AboutContent>(defaultAboutContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "content", "about"),
            (doc) => {
                if (doc.exists()) {
                    setContent(doc.data() as AboutContent);
                }
                setLoading(false);
            },
            (error) => {
                console.error("About content fetch error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { content, loading };
}
