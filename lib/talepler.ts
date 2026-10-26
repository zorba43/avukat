/**
 * "Bizden başlıca talepleriniz" seçenekleri — DB'de kısa kod (value) saklanır,
 * form, detay sayfası ve Telegram mesajı etiketi buradan okur.
 */
export const TALEP_SECENEKLERI = [
  { value: "yaralanma-tazminati", label: "Yaralanmadan Kaynaklı Tazminat" },
  { value: "vefat-tazminati", label: "Vefat Nedeniyle Tazminat" },
  { value: "hasar-bedeli", label: "Hasar Bedeli" },
  { value: "mahrum-kalinan-kullanim", label: "Mahrum Kalınan Kullanım Bedeli" },
  { value: "deger-kaybi", label: "Değer Kaybı" },
] as const;

const TALEP_ETIKETI: Record<string, string> = Object.fromEntries(
  TALEP_SECENEKLERI.map((t) => [t.value, t.label]),
);

export function talepEtiketi(kod: string) {
  return TALEP_ETIKETI[kod] ?? kod;
}

export function gecerliTalepMi(kod: unknown): kod is string {
  return typeof kod === "string" && kod in TALEP_ETIKETI;
}
