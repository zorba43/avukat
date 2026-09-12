/** 11 haneli rakam dizisini "05XX XXX XX XX" biçiminde okunur hale getirir. */
function formatTelefon(raw: string) {
  const d = raw.replace(/\D/g, "");
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
    .filter(Boolean)
    .join(" ");
}

/** ISO tarihi (YYYY-MM-DD ya da Date) "GG.AA.YYYY" biçiminde döndürür. */
function formatTarih(tarih: string | Date) {
  const d = typeof tarih === "string" ? new Date(tarih) : tarih;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Kayıttaki kısa kodu (bkz. KisiselBilgiForm) okunur Türkçe etikete çevirir. */
const BASVURU_NITELIGI_ETIKETI: Record<string, string> = {
  "arac-sahibi-kullanmadi": "Araç Sahibiyim ama aracı ben kullanmadım",
  "arac-soforu": "Araç Şoförü",
  "hem-sahibi-hem-soforu": "Hem araç sahibi hem araç şoförü",
  yolcu: "Yolcu",
};

async function telegramMesajGonder(metin: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error(
      "Telegram bildirimi gönderilemedi: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID tanımlı değil.",
    );
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: metin }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Telegram API hatası:", res.status, body);
  }
}

export async function sendKazaBildirimNotification({
  isimSoyisim,
  telefon,
  kazaTarihi,
  basvuruNiteligi,
  basvuruId,
  karsiTarafVarMi,
}: {
  isimSoyisim: string;
  telefon: string;
  kazaTarihi: string | Date;
  basvuruNiteligi: string;
  basvuruId: string;
  /** true ise mesaja "Karşı Taraf Belgeleri: Yüklendi ✓" satırı eklenir; hiç yüklenmediyse satır hiç gösterilmez. */
  karsiTarafVarMi?: boolean;
}) {
  const karsiTarafSatiri = karsiTarafVarMi
    ? "\nKarşı Taraf Belgeleri: Yüklendi ✓"
    : "";

  const message = `
🚨 Yeni Kaza Bildirimi

Ad Soyad: ${isimSoyisim}
Telefon: ${formatTelefon(telefon)}
Kaza Tarihi: ${formatTarih(kazaTarihi)}
Başvuranın Niteliği: ${BASVURU_NITELIGI_ETIKETI[basvuruNiteligi] ?? basvuruNiteligi}${karsiTarafSatiri}

📎 Dosyalara erişmek için: ${process.env.NEXT_PUBLIC_SITE_URL}/basvuru/${basvuruId}
  `.trim();

  await telegramMesajGonder(message);
}

export async function sendEkBelgeNotification({
  basvuruNo,
  isimSoyisim,
  eklenen,
  basvuruId,
}: {
  basvuruNo: string;
  isimSoyisim: string;
  /** Örn. "Kaza Raporu" ya da "3 adet Fotoğraf" */
  eklenen: string;
  basvuruId: string;
}) {
  const message = `
📎 Başvuruya Ek Belge Eklendi

Başvuru No: ${basvuruNo}
Ad Soyad: ${isimSoyisim}
Eklenen: ${eklenen}

Detaylar: ${process.env.NEXT_PUBLIC_SITE_URL}/basvuru/${basvuruId}
  `.trim();

  await telegramMesajGonder(message);
}
