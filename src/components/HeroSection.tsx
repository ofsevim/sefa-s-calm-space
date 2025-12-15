import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeroContent } from "@/hooks/useContent";
import { WaveSeparator } from "@/components/ui/WaveSeparator";

export const HeroSection = () => {
  const { content, loading } = useHeroContent();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen pt-36 pb-16 flex items-start bg-gradient-hero relative overflow-hidden"
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

        {/* Subtle Wave Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 Q 25 20 50 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full"
            >

              {loading ? (
                <div className="flex flex-col items-center lg:items-start gap-4 mb-6 w-full">
                  <Skeleton className="h-10 sm:h-14 md:h-16 w-3/4 rounded-lg" />
                  <Skeleton className="h-10 sm:h-14 md:h-16 w-1/2 rounded-lg" />
                </div>
              ) : (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-6"
                >
                  {content.title}{" "}
                  <span className="text-primary">{content.titleHighlight}</span>
                </motion.h1>
              )}

              {loading ? (
                <div className="flex flex-col items-center lg:items-start gap-2 mb-8 w-full max-w-xl">
                  <Skeleton className="h-5 w-full rounded" />
                  <Skeleton className="h-5 w-5/6 rounded" />
                  <Skeleton className="h-5 w-4/6 rounded" />
                </div>
              ) : (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
                >
                  {content.description}
                </motion.p>
              )}

              {loading ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Skeleton className="h-14 w-40 rounded-full" />
                  <Skeleton className="h-14 w-40 rounded-full" />
                </div>
              ) : (
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
                    {content.primaryButtonText}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="hero-outline"
                    size="xl"
                    onClick={() => scrollToSection("#hizmetler")}
                    className="group"
                  >
                    <BookOpen className="w-5 h-5" />
                    {content.secondaryButtonText}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Visual Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
              {/* Abstract Blob Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sage-light/30 rounded-full blur-3xl animate-pulse" />

              {/* Image Frame */}
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden border-8 border-white/40 shadow-2xl bg-white/20 backdrop-blur-sm group">
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <img
                    src={content.heroImage}
                    alt={content.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-sage-dark/20 to-transparent" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-beige-warm/50 rounded-full blur-xl" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-teal-light/30 rounded-full blur-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
