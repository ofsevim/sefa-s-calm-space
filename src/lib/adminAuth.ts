import { getIdTokenResult, type User } from "firebase/auth";

const DEFAULT_ADMIN_EMAILS = [
    "sefasevim46@gmail.com",
    "omersvm0606@gmail.com",
    "sefa.sevim@outlook.com",
];

export async function isAdminUser(user: User, forceRefresh = false): Promise<boolean> {
    if (!user || !user.email) return false;

    const normalizedEmail = user.email.trim().toLowerCase();
    const allowedEmails = new Set(DEFAULT_ADMIN_EMAILS);

    // 1. Önce yerel hafızadaki izinli e-postayı kontrol et (0ms - anında yanıt)
    if (allowedEmails.has(normalizedEmail)) {
        return true;
    }

    // 2. Özel yetkili (custom claims) kontrolü (sadece gerekirse ağ çağrısı yap)
    try {
        const token = await getIdTokenResult(user, forceRefresh);
        if (token.claims.admin === true) return true;
    } catch (err) {
        console.warn("Token claims okunamadı:", err);
    }

    return false;
}
