export function formatWhatsappLink(phone: string, text: string): string {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0")
        ? `9${cleanPhone}`
        : cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}
