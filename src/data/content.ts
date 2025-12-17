import {
    User,
    Users,
    Brain,
    Compass,
    Monitor,
    CalendarCheck,
    Link2,
    Video,
    Globe,
    Home,
    Lock,
    GraduationCap,
    Heart,
    Shield,
    Award,
    Mail,
    Phone,
    MapPin,
    Instagram,
    Linkedin,
} from "lucide-react";

export const services = [
    {
        icon: User,
        title: "Bireysel Danışmanlık",
        description:
            "Kişisel gelişim, özgüven, ilişki sorunları ve yaşam zorlukları için birebir destek.",
        color: "bg-sage-light",
        iconColor: "text-sage-dark",
        image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800&auto=format&fit=crop", // Woman looking thoughtful/serene
    },
    {
        icon: Users,
        title: "Ergen Danışmanlığı",
        description:
            "Ergenlik döneminin zorluklarında gençlere ve ailelerine profesyonel rehberlik.",
        color: "bg-beige-warm",
        iconColor: "text-secondary",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop", // Friends/Teenagers group
    },
    {
        icon: Brain,
        title: "Sınav Kaygısı",
        description:
            "Sınav stresi ve performans kaygısını yönetmek için etkili teknikler ve stratejiler.",
        color: "bg-sage-light",
        iconColor: "text-sage-dark",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop", // Studying/Focus
    },
    {
        icon: Compass,
        title: "Kariyer Danışmanlığı",
        description:
            "Meslek seçimi, kariyer planlaması ve iş hayatı zorluklarında yol gösterici destek.",
        color: "bg-beige-warm",
        iconColor: "text-secondary",
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800&auto=format&fit=crop", // Working/Career
    },
    {
        icon: Monitor,
        title: "Online Terapi",
        description:
            "Evinizin konforunda, güvenli ve etkili online psikolojik danışmanlık hizmeti.",
        color: "bg-sage-light",
        iconColor: "text-sage-dark",
        image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=800&auto=format&fit=crop", // Laptop/Online connection
    },
];

export const faqs = [
    {
        question: "Seanslar ne kadar sürer?",
        answer:
            "Her seans yaklaşık 50 dakika sürmektedir. İlk görüşme biraz daha uzun olabilir çünkü bu süreçte sizinle tanışmak, ihtiyaçlarınızı anlamak ve birlikte bir yol haritası çizmek için zaman ayırıyoruz. Seans süreleri ihtiyaca göre esnek tutulabilir.",
    },
    {
        question: "Online terapi etkili midir?",
        answer:
            "Evet, çok sayıda bilimsel araştırma online terapinin yüz yüze terapi kadar etkili olduğunu göstermektedir. Özellikle depresyon, anksiyete ve stres yönetimi gibi konularda online terapi oldukça başarılı sonuçlar vermektedir. Ayrıca ev ortamınızda olmanız, bazı danışanlar için daha rahat ve açık bir iletişim sağlayabilir.",
    },
    {
        question: "Gizlilik politikası nedir?",
        answer:
            "Gizlilik, psikolojik danışmanlık sürecinin en temel ilkelerinden biridir. Görüşmelerimizde paylaştığınız tüm bilgiler tamamen gizli tutulmaktadır. Yasal zorunluluklar (size veya başkalarına ciddi zarar riski) dışında hiçbir bilgi üçüncü kişilerle paylaşılmaz. Online görüşmeler için şifreli ve güvenli platformlar kullanılmaktadır.",
    },
    {
        question: "İlk görüşmeye nasıl hazırlanmalıyım?",
        answer:
            "İlk görüşmeye özel bir hazırlık yapmanıza gerek yok. Rahat bir ortamda, kesintisiz konuşabileceğiniz bir zaman dilimi seçmeniz yeterli. İsterseniz aklınıza gelen soruları not alabilirsiniz. En önemlisi, kendinizi yargılamadan, olduğunuz gibi gelmenizdir. İlk görüşme tanışma ve ihtiyaçlarınızı anlama sürecidir.",
    },
    {
        question: "Kaç seans gerekir?",
        answer:
            "Seans sayısı tamamen kişisel ihtiyaçlara ve hedeflere bağlıdır. Bazı danışanlar 4-6 seansta hedeflerine ulaşırken, bazıları daha uzun süreli destek almayı tercih edebilir. İlk görüşmelerde birlikte bir plan oluşturur ve süreci birlikte değerlendiririz. Amaç, size en uygun ve etkili desteği sunmaktır.",
    },
    {
        question: "Randevumu iptal etmem gerekirse ne yapmalıyım?",
        answer:
            "Randevunuzu en az 24 saat öncesinden iptal etmeniz veya ertelemeniz gerekmektedir. Bu süre içinde bildirimde bulunursanız, randevunuz başka bir tarihe ücretsiz olarak aktarılabilir. 24 saatten kısa sürede yapılan iptallerde seans ücreti tahsil edilebilir. Acil durumlar için her zaman iletişime geçebilirsiniz.",
    },
];

export const steps = [
    {
        number: "01",
        icon: CalendarCheck,
        title: "Randevu Oluştur",
        description:
            "Size uygun gün ve saati seçerek kolayca online randevu oluşturun.",
    },
    {
        number: "02",
        icon: Link2,
        title: "Bağlantı Linkini Al",
        description:
            "Randevunuz onaylandıktan sonra güvenli görüntülü görüşme linkinizi alın.",
    },
    {
        number: "03",
        icon: Video,
        title: "Görüşmeye Başla",
        description:
            "Belirlenen saatte linke tıklayarak seansınıza başlayın. Bu kadar basit!",
    },
];


// Wait, benefits had 3 items in OnlineTherapySection.tsx.
// 1. Globe
// 2. Home
// 3. Lock
// I accidentally added a 4th one or duplicated. Let me correct.

export const onlineTherapyBenefits = [
    {
        icon: Globe,
        title: "Her Yerden Erişim",
        description: "Nerede olursanız olun, profesyonel desteğe ulaşın",
    },
    {
        icon: Home,
        title: "Ev Konforu",
        description: "Güvenli ve rahat ortamınızdan ayrılmadan görüşün",
    },
    {
        icon: Lock,
        title: "Tam Gizlilik",
        description: "Şifreli bağlantı ile %100 güvenli görüşmeler",
    },
];

export const credentials = [
    {
        icon: GraduationCap,
        title: "PDR Mezunu",
        description: "Psikolojik Danışmanlık ve Rehberlik alanında lisans derecesi",
    },
    {
        icon: Heart,
        title: "Empatik Yaklaşım",
        description: "Danışan merkezli, anlayışlı ve destekleyici terapi ortamı",
    },
    {
        icon: Shield,
        title: "Gizlilik Garantisi",
        description: "Tüm görüşmeler %100 gizlilik ile korunmaktadır",
    },
    {
        icon: Award,
        title: "Sürekli Gelişim",
        description: "Güncel araştırma ve teknikleri takip eden profesyonel yaklaşım",
    },
];

export const contactInfo = [
    {
        icon: Mail,
        label: "E-posta",
        value: "iletisim@sefasevim.com",
        href: "mailto:iletisim@sefasevim.com",
    },
    {
        icon: Phone,
        label: "Telefon",
        value: "+90 555 123 4567",
        href: "tel:+905551234567",
    },
    {
        icon: MapPin,
        label: "Konum",
        value: "Onikişubat, Kahramanmaraş",
        href: "https://www.google.com/maps/search/?api=1&query=Onikişubat,+Kahramanmaraş",
    },
];

export const workingHours = [
    { day: "Pazartesi - Cuma", hours: "09:00 - 19:00" },
    { day: "Cumartesi", hours: "10:00 - 16:00" },
    { day: "Pazar", hours: "Kapalı" },
];

export const quickLinks = [
    { name: "Anasayfa", href: "#hero" },
    { name: "Hakkımda", href: "#hakkimda" },
    { name: "Hizmetler", href: "#hizmetler" },
    { name: "SSS", href: "#sss" },
    { name: "İletişim", href: "#iletisim" },
];

export const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/psk.dan.sefasevim/", label: "Instagram" },
];
