import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, MailOpen, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Message {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export default function Messages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];
            setMessages(data);
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
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;

        try {
            await deleteDoc(doc(db, "messages", id));
            setMessages(messages.filter((msg) => msg.id !== id));
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
            setMessages(messages.map(msg =>
                msg.id === id ? { ...msg, read: !currentStatus } : msg
            ));
        } catch (error) {
            console.error("Error updating message status:", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Mesajlar</h1>
                <div className="text-muted-foreground">
                    Toplam {messages.length} mesaj
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Gönderen</TableHead>
                            <TableHead>İletişim</TableHead>
                            <TableHead className="w-[40%]">Mesaj</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.length === 0 ? (
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
                                        {format(new Date(msg.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                                    </TableCell>
                                    <TableCell className="font-medium">{msg.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{msg.email}</span>
                                            <span className="text-muted-foreground">{msg.phone}</span>
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
        </div>
    );
}
