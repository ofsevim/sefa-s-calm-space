import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { faqs as defaultFaqs } from "@/data/content";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [faqs, setFaqs] = useState<FAQItem[]>(defaultFaqs);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const docRef = doc(db, "settings", "faqs");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().items) {
          setFaqs(docSnap.data().items);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };
    fetchFAQs();
  }, []);

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
