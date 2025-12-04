import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Heart, Shield, Award } from "lucide-react";
import heroPortrait from "@/assets/hero-portrait.jpg";

const credentials = [
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

export const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="hakkimda" className="section-padding bg-background" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative max-w-md mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-3xl overflow-hidden shadow-card"
              >
                <img
                  src={heroPortrait}
                  alt="Sefa Sevim - Psikolojik Danışman"
                  className="w-full h-auto object-cover aspect-square"
                />
              </motion.div>

              {/* Experience badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -right-6 glass rounded-2xl p-6 shadow-card"
              >
                <div className="text-center">
                  <div className="text-4xl font-heading font-bold text-secondary">
                    5+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Yıllık Deneyim
                  </div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -top-4 -left-4 w-full h-full rounded-3xl border-2 border-sage-light" />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-2 rounded-full bg-sage-light/50 text-secondary text-sm font-medium mb-4"
            >
              Hakkımda
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6"
            >
              Merhaba, Ben{" "}
              <span className="text-primary">Sefa Sevim</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground leading-relaxed mb-6"
            >
              PDR (Psikolojik Danışmanlık ve Rehberlik) alanında eğitim almış,
              bilimsel temelli ve empatik yaklaşımı benimseyen bir psikolojik
              danışmanım. Her bireyin kendine özgü hikayesi olduğuna inanıyor ve
              bu hikayeyi anlamak için buradayım.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="text-lg text-muted-foreground leading-relaxed mb-8"
            >
              Amacım, sizinle birlikte güvenli bir alan yaratarak içsel
              farkındalığınızı artırmanıza ve yaşam kalitenizi yükseltmenize
              yardımcı olmaktır. Her seans, size özel tasarlanmış bir yolculuktur.
            </motion.p>

            {/* Credentials Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {credentials.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card hover:shadow-soft transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
