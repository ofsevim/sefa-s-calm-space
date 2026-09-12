import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import {
  Send,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { contactInfo, workingHours } from "@/data/content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LazyBookingForm } from "@/components/LazyBookingForm";

import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();

  const [contactData, setContactData] = useState(contactInfo);
  const [hoursData, setHoursData] = useState(workingHours);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const generalRef = doc(db, "settings", "general");
        const hoursRef = doc(db, "settings", "workingHours");

        const [generalSnap, hoursSnap] = await Promise.all([
          getDoc(generalRef),
          getDoc(hoursRef),
        ]);

        if (generalSnap.exists()) {
          const data = generalSnap.data();
          const updatedContact = contactInfo
            .map(item => {
              if (item.label === "E-posta" && data.email) return { ...item, value: data.email, href: `mailto:${data.email}` };
              if (item.label === "Konum" && data.address) return { ...item, value: data.address };
              return item;
            })
            .filter(item => item.label !== "Telefon");
          setContactData(updatedContact);
        }

        if (hoursSnap.exists() && hoursSnap.data().items) {
          setHoursData(hoursSnap.data().items);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return;
    if (!formData.consent) {
      toast({ variant: "destructive", title: "Onay gerekli", description: "Lütfen aydınlatma metnini okuyup onaylayın." });
      return;
    }
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "messages"), {
        name: formData.name.trim(),
        email: formData.email.trim().toLocaleLowerCase("tr-TR"),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        createdAt: serverTimestamp(),
        read: false,
        consent_version: "2026-09-13",
      });

      toast({
        title: "Mesajınız Alındı!",
        description: "En kısa sürede sizinle iletişime geçeceğim.",
      });

      setFormData({ name: "", email: "", phone: "", message: "", website: "", consent: false });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="iletisim"
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
            İletişim
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Randevu & <span className="text-primary">İletişim</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Sorularınız için veya randevu oluşturmak için benimle iletişime
            geçebilirsiniz.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-card">
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-6">
                Mesaj Gönderin
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Telefon (Opsiyonel)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={20}
                    pattern="[+0-9 ()-]{10,20}"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="0555 555 55 55"
                  />
                </div>

                <div className="absolute -left-[10000px]" aria-hidden="true">
                  <label htmlFor="website">Web sitesi</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    placeholder="Mesajınızı buraya yazabilirsiniz..."
                  />
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <Checkbox
                    id="contact-consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData((current) => ({ ...current, consent: checked === true }))}
                  />
                  <label htmlFor="contact-consent" className="text-sm leading-relaxed text-muted-foreground">
                    <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="underline text-foreground">KVKK Aydınlatma Metni</a> ve
                    {" "}<a href="/gizlilik" target="_blank" rel="noopener noreferrer" className="underline text-foreground">Gizlilik Politikası</a>'nı okudum.
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      Mesaj Gönder
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info & Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Booking Widget */}
            <motion.div
              id="randevu"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 }}
              className="bg-gradient-sage rounded-3xl p-8 text-primary-foreground"
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6" />
                <h4 className="font-heading font-semibold text-lg">
                  Online Randevu
                </h4>
              </div>
              <p className="text-primary-foreground/80 mb-6">
                Size en uygun gün ve saati seçerek hemen online randevu
                oluşturabilirsiniz.
              </p>
              <div className="bg-primary-foreground/10 rounded-2xl p-6 backdrop-blur-sm">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="glass"
                      size="lg"
                      className="w-full text-foreground"
                    >
                      Randevu Oluştur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Randevu Oluştur</DialogTitle>
                      <DialogDescription>
                        Aşağıdaki formu doldurarak randevu talebinizi iletebilirsiniz.
                      </DialogDescription>
                    </DialogHeader>
                    <LazyBookingForm />
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>

            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactData.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  target={item.label === "Konum" ? "_blank" : undefined}
                  rel={item.label === "Konum" ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow group"
                >
                  <div className="w-14 h-14 rounded-xl bg-sage-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="font-medium text-foreground">
                      {item.value}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Working Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="bg-card rounded-3xl p-6 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-secondary" />
                <h4 className="font-heading font-semibold text-foreground">
                  Çalışma Saatleri
                </h4>
              </div>
              <div className="space-y-3">
                {hoursData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-muted-foreground">{item.day}</span>
                    <span className="font-medium text-foreground">
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>


          </motion.div>
        </div>
      </div>
    </section>
  );
};
