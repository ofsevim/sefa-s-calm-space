import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, HelpCircle, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FAQItem {
    question: string;
    answer: string;
}

const defaultFAQs: FAQItem[] = [
    {
        question: "Online terapi nasıl çalışır?",
        answer: "Online terapi, güvenli video konferans platformları üzerinden gerçekleştirilir. Randevu saatinizde size gönderilen bağlantıya tıklayarak seansa katılabilirsiniz. Tıpkı yüz yüze görüşme gibi, güvenli ve gizli bir ortamda profesyonel destek alırsınız."
    },
    {
        question: "Bir seans ne kadar sürüyor?",
        answer: "Standart bir bireysel terapi seansı 50 dakika sürmektedir. İlk görüşme (tanışma seansı) ise duruma göre 60-75 dakika arası sürebilir."
    },
    {
        question: "Randevumu nasıl iptal edebilirim?",
        answer: "Randevunuzu en az 24 saat önceden iptal etmeniz gerekmektedir. İptal işlemi için telefon veya e-posta ile iletişime geçebilirsiniz."
    },
    {
        question: "Görüşmeler gizli mi?",
        answer: "Evet, tüm görüşmeler tamamen gizlidir. Mesleki etik kuralları ve yasal düzenlemeler çerçevesinde, paylaştığınız bilgiler izniniz olmadan üçüncü kişilerle paylaşılmaz."
    },
    {
        question: "Hangi konularda danışmanlık alabiliyorum?",
        answer: "Bireysel gelişim, ilişki sorunları, sınav kaygısı, kariyer danışmanlığı, ergenlik dönemi zorlukları, stres yönetimi ve benzeri pek çok konuda profesyonel destek alabilirsiniz."
    }
];

export default function FAQManagement() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [faqs, setFaqs] = useState<FAQItem[]>(defaultFAQs);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    // Fetch FAQs from Firestore
    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                setFetching(true);
                const docRef = doc(db, "settings", "faqs");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().items) {
                    setFaqs(docSnap.data().items);
                }
            } catch (error) {
                console.error("FAQ yüklenirken hata:", error);
                toast.error("SSS yüklenemedi");
            } finally {
                setFetching(false);
            }
        };

        fetchFAQs();
    }, []);

    // Save FAQs to Firestore
    const saveFAQs = async () => {
        // Validate
        const hasEmpty = faqs.some(faq => !faq.question.trim() || !faq.answer.trim());
        if (hasEmpty) {
            toast.error("Lütfen tüm soru ve cevapları doldurun");
            return;
        }

        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "faqs"), {
                items: faqs,
                updatedAt: new Date().toISOString()
            });
            toast.success("SSS başarıyla kaydedildi!");
        } catch (error) {
            console.error("FAQ kaydetme hatası:", error);
            toast.error("Kaydetme işlemi başarısız oldu");
        } finally {
            setLoading(false);
        }
    };

    // Add new FAQ
    const addFAQ = () => {
        setFaqs([...faqs, { question: "", answer: "" }]);
    };

    // Remove FAQ
    const removeFAQ = (index: number) => {
        const newFaqs = [...faqs];
        newFaqs.splice(index, 1);
        setFaqs(newFaqs);
        setDeleteIndex(null);
    };

    // Update FAQ
    const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };

    // Move FAQ up
    const moveFAQ = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === faqs.length - 1) return;

        const newFaqs = [...faqs];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];
        setFaqs(newFaqs);
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                            SSS Yönetimi
                        </h1>
                        <p className="text-muted-foreground">
                            Sıkça Sorulan Soruları buradan düzenleyebilirsiniz.
                        </p>
                    </div>
                    <Button onClick={addFAQ} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Soru Ekle
                    </Button>
                </div>
            </motion.div>

            {/* FAQ List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            <CardTitle>Sıkça Sorulan Sorular ({faqs.length})</CardTitle>
                        </div>
                        <CardDescription>
                            Soruları sürükleyerek sıralayabilir, düzenleyebilir veya silebilirsiniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {faqs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Henüz soru eklenmemiş.</p>
                                <Button onClick={addFAQ} variant="link" className="mt-2">
                                    İlk soruyu ekleyin
                                </Button>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`item-${index}`}
                                        className="border rounded-lg px-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col gap-1 py-2">
                                                <button
                                                    onClick={() => moveFAQ(index, 'up')}
                                                    disabled={index === 0}
                                                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    onClick={() => moveFAQ(index, 'down')}
                                                    disabled={index === faqs.length - 1}
                                                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                            <span className="text-sm text-muted-foreground font-medium w-6">
                                                {index + 1}.
                                            </span>
                                            <AccordionTrigger className="flex-1 text-left hover:no-underline">
                                                <span className={faq.question ? "" : "text-muted-foreground italic"}>
                                                    {faq.question || "Soru girilmemiş..."}
                                                </span>
                                            </AccordionTrigger>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteIndex(index);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <AccordionContent className="pt-2 pb-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`question-${index}`}>Soru</Label>
                                                <Input
                                                    id={`question-${index}`}
                                                    value={faq.question}
                                                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                                    placeholder="Soruyu yazın..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`answer-${index}`}>Cevap</Label>
                                                <Textarea
                                                    id={`answer-${index}`}
                                                    value={faq.answer}
                                                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                                    placeholder="Cevabı yazın..."
                                                    rows={4}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}

                        {faqs.length > 0 && (
                            <div className="pt-4 border-t">
                                <Button onClick={saveFAQs} disabled={loading} className="w-full">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Tüm Değişiklikleri Kaydet
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Soruyu Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu soruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteIndex !== null && removeFAQ(deleteIndex)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
