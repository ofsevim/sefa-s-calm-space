import { getIdTokenResult, type User } from "firebase/auth";

const ADMIN_EMAILS = new Set(["sefa.sevim@outlook.com"]);

export async function isAdminUser(user: User, forceRefresh = false): Promise<boolean> {
  const token = await getIdTokenResult(user, forceRefresh);
  return token.claims.admin === true || ADMIN_EMAILS.has(user.email?.toLocaleLowerCase("tr-TR") ?? "");
}

