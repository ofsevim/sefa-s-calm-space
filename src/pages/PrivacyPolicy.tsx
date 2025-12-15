import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Mail, Phone } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <>
            <Helmet>
                <title>Gizlilik Politikası | Psk. Dan. Sefa Sevim</title>
                <meta
                    name="description"
                    content="Psikolojik Danışman Sefa Sevim gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi."
                />
            </Helmet>

            <main className="overflow-hidden">
                <Navbar />

                <section className="pt-32 pb-20 bg-gradient-calm min-h-screen">
                    <div className="container-custom">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl mx-auto"
                        >
                            {/* Header */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                                    <Shield className="w-8 h-8 text-primary" />
                                </div>
                                <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
                                    Gizlilik Politikası
                                </h1>
                                <p className="text-muted-foreground">
                                    Son güncelleme: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="bg-card rounded-3xl p-8 lg:p-12 shadow-soft space-y-8">
                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <FileText className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">1. Giriş</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Psikolojik Danışman Sefa Sevim olarak, kişisel verilerinizin gizliliğine önem veriyoruz.
                                        Bu gizlilik politikası, web sitemizi kullandığınızda kişisel verilerinizin nasıl toplandığını,
                                        kullanıldığını ve korunduğunu açıklar. Sitemizi kullanarak bu politikayı kabul etmiş sayılırsınız.
                                    </p>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Eye className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">2. Toplanan Bilgiler</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Aşağıdaki kişisel bilgileri toplayabiliriz:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                        <li><strong>İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi</li>
                                        <li><strong>Randevu Bilgileri:</strong> Tercih edilen randevu tarihi ve saati</li>
                                        <li><strong>Mesaj İçerikleri:</strong> İletişim formu aracılığıyla gönderdiğiniz mesajlar</li>
                                        <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, ziyaret edilen sayfalar (anonim olarak)</li>
                                    </ul>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Lock className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">3. Bilgilerin Kullanımı</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Topladığımız bilgiler şu amaçlarla kullanılır:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                        <li>Randevu taleplerinizi işlemek ve sizinle iletişime geçmek</li>
                                        <li>Sorularınızı yanıtlamak ve destek sağlamak</li>
                                        <li>Hizmet kalitemizi geliştirmek</li>
                                        <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">4. Bilgilerin Paylaşımı</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Kişisel verileriniz üçüncü taraflarla paylaşılmaz, satılmaz veya kiralanmaz.
                                        Ancak, yasal zorunluluklar veya mahkeme kararları durumunda gerekli bilgiler
                                        yetkili makamlarla paylaşılabilir.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">5. Çerezler (Cookies)</h2>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Çerezler şu amaçlarla kullanılır:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                        <li><strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması için gerekli</li>
                                        <li><strong>Tercih Çerezleri:</strong> Dil ve tema gibi tercihlerinizi hatırlamak için</li>
                                        <li><strong>Analitik Çerezler:</strong> Site kullanımını analiz etmek için (anonim)</li>
                                    </ul>
                                    <p className="text-muted-foreground leading-relaxed mt-4">
                                        Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">6. Veri Güvenliği</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Kişisel verilerinizi korumak için SSL şifreleme, güvenli sunucular ve düzenli güvenlik
                                        güncellemeleri gibi teknik ve organizasyonel önlemler alıyoruz. Ancak, internet üzerinden
                                        yapılan hiçbir veri iletiminin %100 güvenli olmadığını unutmayın.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">7. Haklarınız</h2>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        KVKK kapsamında aşağıdaki haklara sahipsiniz:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                                        <li>İşlenen verilere ilişkin bilgi talep etme</li>
                                        <li>Verilerin düzeltilmesini veya silinmesini isteme</li>
                                        <li>Verilerin üçüncü kişilere aktarılıp aktarılmadığını öğrenme</li>
                                        <li>İşleme faaliyetine itiraz etme</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">8. İletişim</h2>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                                    </p>
                                    <div className="flex flex-col gap-2 text-muted-foreground">
                                        <a href="mailto:Sefa.Sevim@outlook.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                                            <Mail className="w-4 h-4" />
                                            Sefa.Sevim@outlook.com
                                        </a>
                                    </div>
                                </section>

                                <section className="pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground text-center">
                                        Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler olması
                                        durumunda web sitemiz üzerinden bilgilendirileceksiniz.
                                    </p>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
};

export default PrivacyPolicy;
