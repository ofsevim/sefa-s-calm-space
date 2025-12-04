import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPortrait from "@/assets/hero-portrait.jpg";

export const HeroSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen pt-20 flex items-center bg-gradient-hero relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sage-light/30 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-beige-warm/50 blur-3xl"
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light/50 text-secondary text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              PDR Mezunu Psikolojik Danışman
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-6"
            >
              Kendini Keşfetme Yolculuğunda{" "}
              <span className="text-primary">Yanındayım</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Psikolojik Danışman Sefa Sevim ile bilimsel temelli ve empatik
              yaklaşımlarla içsel huzurunuzu keşfedin.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                variant="hero"
                size="xl"
                onClick={() => scrollToSection("#iletisim")}
                className="group"
              >
                Hemen Randevu Al
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="hero-outline"
                size="xl"
                onClick={() => scrollToSection("#hizmetler")}
                className="group"
              >
                <Play className="w-5 h-5" />
                Hizmetleri İncele
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border"
            >
              {[
                { value: "500+", label: "Danışan" },
                { value: "5+", label: "Yıl Deneyim" },
                { value: "%98", label: "Memnuniyet" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-secondary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="relative max-w-md mx-auto lg:max-w-none">
              {/* Main Image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 rounded-3xl overflow-hidden shadow-card"
              >
                <img
                  src={heroPortrait}
                  alt="Psikolojik Danışman Sefa Sevim"
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/20 to-transparent" />
              </motion.div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 -left-4 sm:-left-8 z-20 glass rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-sage flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      PDR Mezunu
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lisanslı Danışman
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="absolute -top-4 -right-4 sm:-right-8 z-20 glass rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-beige-warm flex items-center justify-center">
                    <span className="text-2xl">💚</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      Online & Yüz Yüze
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Esnek Seçenekler
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Background decoration */}
              <div className="absolute -z-10 top-8 right-8 w-full h-full rounded-3xl bg-sage-light/50" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
