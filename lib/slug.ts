/**
 * Türkçe karakter içeren bir ismi URL/klasör adı için güvenli bir slug'a
 * çevirir. Örnek: "Ahmet Yılmaz" -> "ahmet-yilmaz", "Şükrü Öztürk" -> "sukru-ozturk".
 * Yalnızca Blob depolamada okunur klasör adları için kullanılır — veritabanı
 * id'si ve /basvuru/[id] linki bundan bağımsız, tam UUID olarak kalır.
 */
const TURKCE_HARITASI: Record<string, string> = {
  ı: "i",
  İ: "i",
  ğ: "g",
  Ğ: "g",
  ş: "s",
  Ş: "s",
  ç: "c",
  Ç: "c",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
};

export function slugifyIsim(isim: string): string {
  const donusturulmus = isim
    .split("")
    .map((karakter) => TURKCE_HARITASI[karakter] ?? karakter)
    .join("");

  const slug = donusturulmus
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "basvuru";
}
