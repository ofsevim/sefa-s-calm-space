import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc, limit, startAfter, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, MailOpen, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toDate, type FirestoreDateValue } from "@/lib/firestoreDates";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: FirestoreDateValue;
    read: boolean;
}

export default function Messages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const lastDocument = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const { toast } = useToast();

    const fetchMessages = useCallback(async (reset = true) => {
        setLoading(true);
        try {
            const q = reset || !lastDocument.current
                ? query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50))
                : query(collection(db, "messages"), orderBy("createdAt", "desc"), startAfter(lastDocument.current), limit(50));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];
            setMessages((current) => reset ? data : [...current, ...data]);
            lastDocument.current = querySnapshot.docs.at(-1) ?? null;
            setHasMore(querySnapshot.size === 50);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Mesajlar yüklenirken bir hata oluştu.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void fetchMessages(true);
    }, [fetchMessages]);

    const handleDelete = async (id: string) => {
        if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;

        try {
            await deleteDoc(doc(db, "messages", id));
            setMessages((current) => current.filter((msg) => msg.id !== id));
            toast({
                title: "Başarılı",
                description: "Mesaj silindi.",
            });
        } catch (error) {
            console.error("Error deleting message:", error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Mesaj silinirken bir hata oluştu.",
            });
        }
    };

    const toggleReadStatus = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "messages", id), {
                read: !currentStatus,
            });
            setMessages((current) => current.map(msg =>
                msg.id === id ? { ...msg, read: !currentStatus } : msg
            ));
        } catch (error) {
            console.error("Error updating message status:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mesajlar</h1>
                <div className="text-muted-foreground text-xs sm:text-sm">
                    {loading && messages.length === 0 ? "Yükleniyor..." : `Toplam ${messages.length} mesaj`}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">Durum</TableHead>
                            <TableHead className="w-36">Tarih</TableHead>
                            <TableHead className="w-40">Gönderen</TableHead>
                            <TableHead className="w-48">İletişim</TableHead>
                            <TableHead>Mesaj</TableHead>
                            <TableHead className="text-right w-16">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && messages.length === 0 ? (
                            [1, 2, 3, 4].map((i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-6 w-6 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Henüz hiç mesaj yok.
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
                                <TableRow key={msg.id} className={msg.read ? "bg-muted/30" : "bg-card"}>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleReadStatus(msg.id, msg.read)}
                                            title={msg.read ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                                        >
                                            {msg.read ? (
                                                <MailOpen className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Mail className="h-4 w-4 text-primary" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {format(toDate(msg.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                                    </TableCell>
                                    <TableCell className="font-medium">{msg.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{msg.email}</span>
                                            {msg.phone && <span className="text-muted-foreground">{msg.phone}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="line-clamp-2 text-sm text-muted-foreground" title={msg.message}>
                                            {msg.message}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(msg.id)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="space-y-3 block md:hidden">
                {loading && messages.length === 0 ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border rounded-xl bg-card space-y-3">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-16 w-full rounded-md" />
                            <div className="flex gap-2 pt-2 border-t">
                                <Skeleton className="h-9 flex-1 rounded-md" />
                                <Skeleton className="h-9 w-20 rounded-md" />
                            </div>
                        </div>
                    ))
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 border rounded-xl bg-card text-muted-foreground text-sm">
                        Henüz hiç mesaj yok.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-4 border rounded-xl shadow-sm space-y-3 ${
                                msg.read
                                    ? "bg-card border-border/70"
                                    : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                            }`}
                        >
                            {/* Card Header: Date & Read status */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                                    <span>
                                        {format(toDate(msg.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                                    </span>
                                </div>
                                <div>
                                    {msg.read ? (
                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                            Okundu
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-primary text-xs">
                                            Yeni
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Sender Name */}
                            <div>
                                <h3 className="font-semibold text-base text-foreground">
                                    {msg.name}
                                </h3>
                            </div>

                            {/* Contact Links */}
                            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                {msg.email && (
                                    <a
                                        href={`mailto:${msg.email}`}
                                        className="inline-flex items-center gap-1.5 hover:underline break-all"
                                    >
                                        <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        <span>{msg.email}</span>
                                    </a>
                                )}
                                {msg.phone && (
                                    <a
                                        href={`tel:${msg.phone}`}
                                        className="inline-flex items-center gap-1.5 hover:underline"
                                    >
                                        <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        <span>{msg.phone}</span>
                                    </a>
                                )}
                            </div>

                            {/* Message Body */}
                            <div className="text-sm bg-muted/40 p-3 rounded-md text-foreground whitespace-pre-wrap break-words">
                                {msg.message}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => toggleReadStatus(msg.id, msg.read)}
                                >
                                    {msg.read ? (
                                        <>
                                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                                            Okunmadı Yap
                                        </>
                                    ) : (
                                        <>
                                            <MailOpen className="h-3.5 w-3.5 mr-1.5" />
                                            Okundu Yap
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10 border-destructive/20 text-xs px-3"
                                    onClick={() => handleDelete(msg.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Sil
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {hasMore && (
                <Button variant="outline" onClick={() => fetchMessages(false)} disabled={loading} className="w-full">
                    {loading ? "Yükleniyor..." : "Daha Fazla Göster"}
                </Button>
            )}
        </div>
    );
}
