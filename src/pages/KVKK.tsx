import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Scale, FileCheck, Users, Database, Shield, AlertCircle, Mail, Phone } from "lucide-react";

const KVKK = () => {
    return (
        <>
            <Helmet>
                <title>KVKK Aydınlatma Metni | Psk. Dan. Sefa Sevim</title>
                <meta
                    name="description"
                    content="6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni. Kişisel veri işleme faaliyetleri hakkında bilgilendirme."
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
                                    <Scale className="w-8 h-8 text-primary" />
                                </div>
                                <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
                                    KVKK Aydınlatma Metni
                                </h1>
                                <p className="text-muted-foreground">
                                    6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında
                                </p>
                            </div>

                            {/* Content */}
                            <div className="bg-card rounded-3xl p-8 lg:p-12 shadow-soft space-y-8">
                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <FileCheck className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">1. Veri Sorumlusu</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        6698 Sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında,
                                        kişisel verileriniz; veri sorumlusu olarak <strong>Psikolojik Danışman Sefa Sevim</strong> tarafından
                                        aşağıda açıklanan kapsamda işlenebilecektir. Bu aydınlatma metni, KVKK'nın 10. maddesi
                                        gereğince veri sorumlusunun aydınlatma yükümlülüğü çerçevesinde hazırlanmıştır.
                                    </p>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Database className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">2. İşlenen Kişisel Veriler</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Tarafınıza ait aşağıdaki kişisel veriler işlenebilmektedir:
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-2 font-semibold">Veri Kategorisi</th>
                                                    <th className="text-left py-2 font-semibold">Açıklama</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-muted-foreground">
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2">Kimlik Bilgileri</td>
                                                    <td className="py-2">Ad, soyad</td>
                                                </tr>
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2">İletişim Bilgileri</td>
                                                    <td className="py-2">E-posta adresi</td>
                                                </tr>
                                                <tr className="border-b border-border/50">
                                                    <td className="py-2">İşlem Güvenliği</td>
                                                    <td className="py-2">IP adresi, tarayıcı bilgileri</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">Talep/Şikayet</td>
                                                    <td className="py-2">İletişim formu mesaj içerikleri</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">3. Kişisel Verilerin İşlenme Amaçları</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                        <li>Psikolojik danışmanlık hizmetlerinin sunulması</li>
                                        <li>Randevu taleplerinin alınması ve yönetilmesi</li>
                                        <li>İletişim taleplerinin yanıtlanması</li>
                                        <li>Hizmet kalitesinin ölçülmesi ve iyileştirilmesi</li>
                                        <li>Yasal düzenlemelerden kaynaklanan yükümlülüklerin yerine getirilmesi</li>
                                        <li>Bilgi güvenliği süreçlerinin yürütülmesi</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">4. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                        <li>Açık rızanızın bulunması</li>
                                        <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
                                        <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
                                        <li>Meşru menfaatler için veri işlenmesinin zorunlu olması</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">5. Kişisel Verilerin Aktarılması</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda,
                                        yurt içinde bulunan yetkili kamu kurum ve kuruluşlarına, hukuki zorunluluk hallerinde
                                        ilgili mercilere aktarılabilmektedir. Bunun dışında üçüncü taraflarla paylaşılmamaktadır.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-heading font-semibold mb-4">6. Kişisel Veri Toplamanın Yöntemi</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Kişisel verileriniz; web sitemiz üzerindeki iletişim formu, randevu formu,
                                        e-posta, telefon ve sair iletişim kanalları aracılığıyla elektronik ortamda toplanmaktadır.
                                    </p>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">7. KVKK'nın 11. Maddesi Kapsamındaki Haklarınız</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
                                    </p>
                                    <div className="grid gap-3">
                                        {[
                                            "Kişisel veri işlenip işlenmediğini öğrenme",
                                            "Kişisel verileri işlenmişse buna ilişkin bilgi talep etme",
                                            "Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme",
                                            "Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme",
                                            "Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme",
                                            "KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme",
                                            "Düzeltme, silme ve yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
                                            "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
                                            "Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme"
                                        ].map((hak, index) => (
                                            <div key={index} className="flex items-start gap-2 text-muted-foreground">
                                                <span className="text-primary font-semibold">{String.fromCharCode(97 + index)})</span>
                                                <span>{hak}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertCircle className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-heading font-semibold">8. Başvuru Yöntemi</h2>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvuruda bulunabilirsiniz:
                                    </p>
                                    <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="font-medium text-foreground">E-posta ile başvuru:</p>
                                                <a href="mailto:Sefa.Sevim@outlook.com" className="text-primary hover:underline">
                                                    Sefa.Sevim@outlook.com
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mt-4">
                                        Başvurunuzda; adınız, soyadınız, başvuru yazılı ise imzanız, T.C. kimlik numaranız,
                                        tebligata esas yerleşim yeri veya iş yeri adresiniz, varsa elektronik posta adresiniz,
                                        telefon numaranız ve talep konunuzun belirtilmesi zorunludur.
                                    </p>
                                </section>

                                <section className="pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground text-center">
                                        Bu aydınlatma metni, 6698 Sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi
                                        uyarınca hazırlanmış olup, gerektiğinde güncellenebilir.
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

export default KVKK;
