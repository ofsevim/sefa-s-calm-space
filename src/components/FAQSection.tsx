import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="sss" className="section-padding bg-background" ref={ref}>
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-sage-light/50 text-secondary text-sm font-medium mb-4">
              SSS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              Sık Sorulan <span className="text-primary">Sorular</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Merak ettiğiniz konularda en çok sorulan soruların cevaplarını
              burada bulabilirsiniz.
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-card rounded-2xl border-none shadow-soft px-6 data-[state=open]:shadow-card transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:text-secondary hover:no-underline py-6 text-base sm:text-lg">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Başka sorularınız mı var?
            </p>
            <a
              href="#iletisim"
              className="text-primary font-medium hover:text-secondary transition-colors underline underline-offset-4"
            >
              Benimle iletişime geçin →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
