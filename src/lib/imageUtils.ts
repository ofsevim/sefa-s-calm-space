/**
 * ImgBB ve harici görsel bağlantılarını otomatik ayrıştıran ve doğrudan
 * görsel bağlantısına dönüştüren yardımcı fonksiyonlar.
 */

/**
 * Gelen metindeki HTML, BBCode, Markdown veya ham bağlantıyı ayrıştırarak
 * doğrudan görsel URL'sini çıkarır.
 */
export function parseImageUrl(rawInput: string): string {
    if (!rawInput) return "";

    let str = rawInput.trim();

    // HTML entity'lerini temizle (&quot;, &#39;, &lt;, &gt;, &amp;)
    str = str
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");

    // 1. HTML <img ... src="..." /> kodunu kontrol et
    const imgMatch = str.match(/<img[^>]+src=["']([^"'\s>]+)["']/i);
    if (imgMatch && imgMatch[1]) {
        return cleanUrl(imgMatch[1]);
    }

    // 2. BBCode [img]...[/img] kodunu kontrol et
    const bbMatch = str.match(/\[img\]\s*(https?:\/\/[^\s\]]+)\s*\[\/img\]/i);
    if (bbMatch && bbMatch[1]) {
        return cleanUrl(bbMatch[1]);
    }

    // 3. Markdown ![...](...) kodunu kontrol et
    const mdMatch = str.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
    if (mdMatch && mdMatch[1]) {
        return cleanUrl(mdMatch[1]);
    }

    // 4. Metin içinde doğrudan i.ibb.co bağlantısı varsa onu al
    const directIbbMatch = str.match(/https?:\/\/i\.ibb\.co\/[^\s"'<>]+/i);
    if (directIbbMatch) {
        return cleanUrl(directIbbMatch[0]);
    }

    // 5. Normal URL bağlantısı varsa çıkar
    const urlMatch = str.match(/https?:\/\/[^\s"'<>]+/i);
    if (urlMatch) {
        return cleanUrl(urlMatch[0]);
    }

    return cleanUrl(str);
}

/**
 * URL sonundaki gereksiz karakterleri veya tırnakları temizler
 */
function cleanUrl(url: string): string {
    return url.replace(/^["']|["']$/g, "").trim();
}

/**
 * Verilen URL'in bir ImgBB sayfa bağlantısı (görüntüleyici bağlantısı) olup olmadığını kontrol eder.
 * Örnek: https://ibb.co/bmMbbKS veya https://imgbb.com/bmMbbKS
 * (i.ibb.co doğrudan resim bağlantıları hariç)
 */
export function isImgbbViewerUrl(url: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(parseImageUrl(url));
        const hostname = parsed.hostname.toLowerCase();
        return ["ibb.co", "www.ibb.co", "imgbb.com", "www.imgbb.com"].includes(hostname)
            && /^\/[a-zA-Z0-9_-]+\/?$/.test(parsed.pathname);
    } catch {
        return false;
    }
}

/**
 * Eğer verilen URL bir ImgBB sayfa linki ise (örn: ibb.co/xyz),
 * arka planda gerçek doğrudan resim linkini (i.ibb.co/...) bulup döndürür.
 */
export async function resolveImageUrl(rawInput: string): Promise<string> {
    const direct = parseImageUrl(rawInput);
    if (!isImgbbViewerUrl(direct)) {
        return direct;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`https://r.jina.ai/${direct}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const text = await response.text();
            // Markdown içindeki i.ibb.co linkini bul
            const match = text.match(/https:\/\/i\.ibb\.co\/[^\s)"'<>]+/i);
            if (match && match[0]) {
                return cleanUrl(match[0]);
            }
        }
    } catch (err) {
        console.warn("ImgBB URL çözümlenemedi, ham URL kullanılıyor:", err);
    }

    return direct;
}

/**
 * URL'in genel olarak geçerli bir formatta olup olmadığını kontrol eder
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}
