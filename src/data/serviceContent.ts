export interface ServiceSEO {
    title: string;
    description: string;
    keywords: string;
    slug: string;
    canonical: string;
}
export interface ServiceStep { number: string; title: string; description: string; }
export interface ServiceFAQ { question: string; answer: string; }
export interface ServiceContent {
    slug: string; seo: ServiceSEO;
    hero: { badge: string; heading: string; subheading: string; };
    intro: string;
    whenNeeded: { title: string; items: string[]; };
    process: { title: string; steps: ServiceStep[]; };
    whoCanBenefit: { title: string; groups: string[]; };
    faqs: ServiceFAQ[];
    cta: { title: string; description: string; buttonText: string; };
}

const BASE_URL = 'https://sefasevim.com';

const createContent = (
    slug: string,
    name: string,
    description: string,
    needs: string[],
    groups: string[],
): ServiceContent => ({
    slug,
    seo: {
        title: `${name} | Psk. Dan. Sefa Sevim`,
        description,
        keywords: `${name.toLocaleLowerCase("tr-TR")}, psikolojik danışmanlık, online danışmanlık, Sefa Sevim`,
        slug,
        canonical: `${BASE_URL}/hizmet/${slug}`,
    },
    hero: { badge: "Psikolojik Danışmanlık", heading: name, subheading: description },
    intro: `${name}, kişinin ihtiyaçları ve hedefleri doğrultusunda yapılandırılan, gizlilik ve mesleki etik ilkeleri gözeten bir psikolojik danışmanlık sürecidir.`,
    whenNeeded: { title: "Hangi durumlarda destek alınabilir?", items: needs },
    process: {
        title: "Süreç nasıl ilerler?",
        steps: [
            { number: "01", title: "İlk görüşme", description: "İhtiyaçlarınız, beklentileriniz ve sürece ilişkin sorularınız değerlendirilir." },
            { number: "02", title: "Yol haritası", description: "Size uygun hedefler ve görüşme çerçevesi birlikte belirlenir." },
            { number: "03", title: "Düzenli takip", description: "İlerleme belirli aralıklarla gözden geçirilir ve süreç ihtiyaca göre güncellenir." },
        ],
    },
    whoCanBenefit: { title: "Kimler yararlanabilir?", groups },
    faqs: [
        { question: "Görüşmeler ne kadar sürer?", answer: "Görüşme süresi ve sıklığı ilk değerlendirmede ihtiyacınıza göre netleştirilir." },
        { question: "Online görüşme yapılabilir mi?", answer: "Uygunluk değerlendirmesinin ardından güvenli bir çevrim içi ortamda görüşme yapılabilir." },
    ],
    cta: {
        title: "İlk adımı birlikte planlayalım",
        description: "Randevu talebinizi iletin; uygun gün ve saat için sizinle iletişime geçelim.",
        buttonText: "Randevu Talebi Oluştur",
    },
});

export const serviceContents: ServiceContent[] = [
    createContent(
        "bireysel-danismanlik",
        "Bireysel Danışmanlık",
        "Kişisel gelişim, duygusal güçlükler ve yaşam zorlukları için bireye özel danışmanlık desteği.",
        ["Kaygı ve stresle baş etme", "Özgüven ve sınır koyma", "İlişki ve iletişim güçlükleri", "Yaşam değişikliklerine uyum"],
        ["Kendisini daha iyi tanımak isteyen yetişkinler", "Yoğun stres veya kararsızlık yaşayanlar", "İlişkilerinde tekrar eden güçlükler yaşayanlar"],
    ),
    createContent(
        "ergen-danismanligi",
        "Ergen Danışmanlığı",
        "Ergenlik dönemindeki değişimlerde gençlere ve ailelerine gelişim odaklı profesyonel destek.",
        ["Okul ve akran sorunları", "Aile içi iletişim", "Duygu düzenleme", "Kimlik ve özgüven gelişimi"],
        ["Ergenlik dönemindeki gençler", "Çocuğuyla iletişimini güçlendirmek isteyen ebeveynler", "Okula uyumda zorlanan öğrenciler"],
    ),
    createContent(
        "sinav-kaygisi",
        "Sınav Kaygısı",
        "Sınav stresi ve performans kaygısını yönetmeye yönelik uygulanabilir teknikler ve danışmanlık.",
        ["Sınav öncesi yoğun kaygı", "Erteleme ve odaklanma güçlüğü", "Olumsuz düşünceler", "Performans sırasında fiziksel belirtiler"],
        ["Ortaöğretim ve üniversite öğrencileri", "Sınava hazırlanan yetişkinler", "Çocuğuna destek olmak isteyen ebeveynler"],
    ),
    createContent(
        "kariyer-danismanligi",
        "Kariyer Danışmanlığı",
        "Eğitim ve meslek seçimlerinde ilgi, değer ve becerilerinizi temel alan kariyer planlama desteği.",
        ["Bölüm veya meslek seçimi", "Kariyer değişikliği", "Kararsızlık ve motivasyon", "Hedef ve gelişim planı oluşturma"],
        ["Lise ve üniversite öğrencileri", "Yeni mezunlar", "Kariyerinde yön değiştirmek isteyen yetişkinler"],
    ),
    createContent(
        "online-terapi",
        "Online Danışmanlık",
        "Bulunduğunuz yerden erişebileceğiniz, gizlilik ilkelerine uygun çevrim içi psikolojik danışmanlık.",
        ["Yüz yüze görüşmeye ulaşım güçlüğü", "Yoğun çalışma veya eğitim programı", "Farklı şehirde veya ülkede yaşama", "Evden görüşme tercihi"],
        ["Çevrim içi görüşmeye uygun yetişkinler", "Sık seyahat edenler", "Bulunduğu yerde hizmete erişemeyenler"],
    ),
];

export function getServiceContent(slug: string | undefined): ServiceContent | undefined {
    return serviceContents.find((content) => content.slug === slug);
}
