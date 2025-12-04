import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { steps, onlineTherapyBenefits as benefits } from "@/data/content";

export const OnlineTherapySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToContact = () => {
    const element = document.querySelector("#iletisim");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="online"
      className="section-padding bg-secondary/5 relative overflow-hidden"
      ref={ref}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sage-light/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-beige-warm/30 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-sage-light/50 text-secondary text-sm font-medium mb-4">
            Online Terapi
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Online Danışmanlık:{" "}
            <span className="text-primary">Nasıl ve Neden?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Teknoloji ile psikolojik desteği bir araya getirerek, size en uygun
            şekilde yardımcı oluyorum.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-sage to-sage-light" />
              )}

              <div className="relative bg-card rounded-3xl p-8 shadow-soft text-center group hover:shadow-hover transition-shadow">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-sage flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-sage-light mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <step.icon className="w-10 h-10 text-secondary" />
                </div>

                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-card rounded-3xl p-8 lg:p-12 shadow-card"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-6">
                Online Terapinin{" "}
                <span className="text-primary">Avantajları</span>
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Araştırmalar, online terapinin yüz yüze terapi kadar etkili
                olduğunu göstermektedir. Üstelik birçok pratik avantajı da
                beraberinde getirir.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button variant="hero" size="lg" onClick={scrollToContact}>
                Online Randevu Al
              </Button>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-gradient-calm rounded-3xl p-8 lg:p-10">
                <div className="space-y-4">
                  {[
                    "Yüz yüze terapi kadar etkili",
                    "Zaman ve ulaşım tasarrufu",
                    "Daha esnek randevu seçenekleri",
                    "Kendi alanınızda kendinizi güvende hissedin",
                    "Coğrafi sınırlamalar olmadan ulaşım",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-soft"
                    >
                      <CheckCircle2 className="w-5 h-5 text-sage flex-shrink-0" />
                      <span className="text-foreground font-medium">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
