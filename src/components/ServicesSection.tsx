import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { services } from "@/data/content";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";

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
      className="section-padding bg-gradient-calm"
      ref={ref}
    >
      <div className="container-custom">
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
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-card rounded-3xl p-8 shadow-soft hover:shadow-hover transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={scrollToContact}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-sage-light/20 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                {/* Icon */}
                <div
                  className={`relative w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {typeof IconComponent === 'string' ? (
                    <DynamicIcon name={IconComponent} className={`w-8 h-8 ${service.iconColor}`} />
                  ) : (
                    <IconComponent className={`w-8 h-8 ${service.iconColor}`} />
                  )}
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-heading font-semibold text-foreground mb-3 group-hover:text-secondary transition-colors">
                  {service.title}
                </h3>
                <p className="relative text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Link */}
                <div className="relative flex items-center gap-2 text-primary font-medium group-hover:text-secondary transition-colors">
                  <span>Detaylı Bilgi</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
};
