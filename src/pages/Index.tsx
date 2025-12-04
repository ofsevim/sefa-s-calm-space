import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { OnlineTherapySection } from "@/components/OnlineTherapySection";
import { FAQSection } from "@/components/FAQSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Psikolojik Danışman Sefa Sevim | Online Terapi & Bireysel Danışmanlık</title>
        <meta
          name="description"
          content="PDR Mezunu Psikolojik Danışman Sefa Sevim ile bilimsel temelli ve empatik yaklaşımla online terapi ve bireysel danışmanlık hizmetleri. Randevu için hemen iletişime geçin."
        />
        <meta
          name="keywords"
          content="psikolojik danışman, online terapi, bireysel danışmanlık, sınav kaygısı, ergen danışmanlığı, kariyer danışmanlığı, İstanbul psikolog"
        />
        <link rel="canonical" href="https://sefasevim.com" />
      </Helmet>
      
      <main className="overflow-hidden">
        <Navbar />
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <OnlineTherapySection />
        <FAQSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
