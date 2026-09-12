import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { isAdminUser } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { FirebaseError } from "firebase/app";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const isAuthorized = await isAdminUser(credential.user, true);

            if (!isAuthorized) {
                await signOut(auth);
                toast({
                    variant: "destructive",
                    title: "Yetkisiz Hesap",
                    description: "Bu e-posta adresinin yönetici paneline erişim yetkisi bulunmuyor.",
                });
                return;
            }

            toast({
                title: "Giriş başarılı",
                description: "Yönetim paneline yönlendiriliyorsunuz.",
            });
            navigate("/admin/dashboard");
        } catch (error: unknown) {
            console.error("Giriş hatası:", error);
            let description = "E-posta veya şifre hatalı.";
            const errorCode = error instanceof FirebaseError ? error.code : "";
            if (errorCode === "auth/too-many-requests") {
                description = "Çok fazla başarısız deneme yapıldı. Lütfen biraz bekleyin veya şifrenizi sıfırlayın.";
            } else if (errorCode === "auth/user-disabled") {
                description = "Bu kullanıcı hesabı devre dışı bırakılmış.";
            } else if (errorCode === "auth/network-request-failed") {
                description = "İnternet bağlantınızı kontrol ediniz.";
            }

            toast({
                variant: "destructive",
                title: "Giriş başarısız",
                description,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            toast({
                variant: "destructive",
                title: "E-posta Gerekli",
                description: "Şifre sıfırlama bağlantısı gönderebilmemiz için lütfen e-posta adresinizi girin.",
            });
            return;
        }

        setResetting(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            toast({
                title: "Sıfırlama E-postası Gönderildi",
                description: "Şifre sıfırlama bağlantısı e-posta adresinize iletildi. Lütfen gelen kutunuzu kontrol edin.",
            });
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Şifre sıfırlama bağlantısı gönderilemedi. E-posta adresinizi kontrol edin.",
            });
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Helmet><title>Yönetici Girişi</title><meta name="robots" content="noindex, nofollow" /></Helmet>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Yönetici Girişi</CardTitle>
                    <CardDescription>Devam etmek için giriş yapın.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Şifre</Label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={resetting}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {resetting ? "Gönderiliyor..." : "Şifremi Unuttum"}
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
