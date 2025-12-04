import { motion } from "framer-motion";
import { Leaf, Instagram, Linkedin, Mail, Heart } from "lucide-react";

const quickLinks = [
  { name: "Anasayfa", href: "#hero" },
  { name: "Hakkımda", href: "#hakkimda" },
  { name: "Hizmetler", href: "#hizmetler" },
  { name: "Online Terapi", href: "#online" },
  { name: "SSS", href: "#sss" },
  { name: "İletişim", href: "#iletisim" },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:iletisim@sefasevim.com", label: "Email" },
];

export const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#hero");
              }}
              className="flex items-center gap-3 mb-6 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-heading text-xl font-semibold text-secondary-foreground block">
                  Psk. Dan. Sefa Sevim
                </span>
                <span className="text-sm text-secondary-foreground/70">
                  Psikolojik Danışman
                </span>
              </div>
            </motion.a>
            <p className="text-secondary-foreground/80 leading-relaxed max-w-md mb-6">
              Bilimsel temelli ve empatik yaklaşımla, kendini keşfetme
              yolculuğunda yanınızdayım. Online ve yüz yüze görüşme
              seçenekleriyle size en uygun desteği sunuyorum.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">
              Hızlı Bağlantılar
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6">
              İletişim
            </h4>
            <ul className="space-y-3 text-secondary-foreground/80">
              <li>
                <a
                  href="mailto:iletisim@sefasevim.com"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  iletisim@sefasevim.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+905551234567"
                  className="hover:text-secondary-foreground transition-colors"
                >
                  +90 555 123 4567
                </a>
              </li>
              <li>İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
            <p>
              © {new Date().getFullYear()} Psk. Dan. Sefa Sevim. Tüm hakları
              saklıdır.
            </p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-destructive" /> in
              Türkiye
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
