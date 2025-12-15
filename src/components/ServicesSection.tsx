import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { services } from "@/data/content";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { WaveSeparator } from "@/components/ui/WaveSeparator";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

export const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [servicesList, setServicesList] = useState(services);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const docRef = doc(db, "settings", "services");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().items) {
          setServicesList(docSnap.data().items);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  const scrollToContact = () => {
    const element = document.querySelector("#iletisim");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hizmetler"
      className="section-padding bg-gradient-calm relative"
      ref={ref}
    >
      <WaveSeparator position="top" className="text-background" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-sage-light/50 text-secondary text-sm font-medium mb-4">
            Hizmetler
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Psikolojik <span className="text-primary">Hizmetler</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            İhtiyaçlarınıza özel, bilimsel temelli ve empatik yaklaşımla sunulan
            profesyonel psikolojik danışmanlık hizmetleri.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {servicesList.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-card rounded-[2rem] shadow-soft hover:shadow-hover transition-all duration-100 cursor-pointer overflow-hidden flex flex-col"
                onClick={scrollToContact}
              >
                {/* Visual Cover Area */}
                <div className={`h-48 w-full ${service.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10" />

                  {/* Image Overlay */}
                  <img
                    src={(service as any).image || [
                      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=800&auto=format&fit=crop"
                    ][index % 6]}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Icon Badge - moved outside image container */}
                <div className="absolute top-40 left-8 z-20">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    {typeof IconComponent === 'string' ? (
                      <DynamicIcon name={IconComponent} className={`w-8 h-8 ${service.iconColor}`} />
                    ) : (
                      <IconComponent className={`w-8 h-8 ${service.iconColor}`} />
                    )}
                  </div>
                </div>

                <div className="p-8 pt-12 flex-grow flex flex-col">
                  <h3 className="relative text-xl font-heading font-semibold text-foreground mb-3 group-hover:text-secondary transition-colors">
                    {service.title}
                  </h3>
                  <p className="relative text-muted-foreground mb-6 leading-relaxed flex-grow">
                    {service.description}
                  </p>

                  {/* Link */}
                  <div className="relative flex items-center gap-2 text-primary font-medium group-hover:text-secondary transition-colors mt-auto">
                    <span>Detaylı Bilgi</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
};
