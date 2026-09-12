/** Türkçe karakterleri ASCII'ye çevirip URL-dostu slug üretir */
export function slugify(text: string): string {
    const trMap: Record<string, string> = {
        ş: "s", Ş: "S",
        ğ: "g", Ğ: "G",
        ü: "u", Ü: "U",
        ö: "o", Ö: "O",
        ı: "i", İ: "I",
        ç: "c", Ç: "C",
    };
    return text
        .split("")
        .map((c) => trMap[c] ?? c)
        .join("")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
