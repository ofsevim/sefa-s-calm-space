import { getIdTokenResult, type User } from "firebase/auth";

const DEFAULT_ADMIN_EMAILS = [
    "sefasevim46@gmail.com",
    "omersvm0606@gmail.com",
    "sefa.sevim@outlook.com",
];

export async function isAdminUser(user: User, forceRefresh = false): Promise<boolean> {
    if (!user || !user.email) return false;

    try {
        const token = await getIdTokenResult(user, forceRefresh);
        if (token.claims.admin === true) return true;
    } catch (err) {
        console.warn("Token claims okunamadı:", err);
    }

    const normalizedEmail = user.email.trim().toLowerCase();

    const allowedEmails = new Set(DEFAULT_ADMIN_EMAILS);
    return allowedEmails.has(normalizedEmail);
}
