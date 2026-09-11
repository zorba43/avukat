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

export async function sendKazaBildirimNotification({
  isimSoyisim,
  telefon,
  kazaTarihi,
  basvuruId,
}: {
  isimSoyisim: string;
  telefon: string;
  kazaTarihi: string | Date;
  basvuruId: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error(
      "Telegram bildirimi gönderilemedi: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID tanımlı değil.",
    );
    return;
  }

  const message = `
🚨 Yeni Kaza Bildirimi

Ad Soyad: ${isimSoyisim}
Telefon: ${formatTelefon(telefon)}
Kaza Tarihi: ${formatTarih(kazaTarihi)}

📎 Dosyalara erişmek için: ${process.env.NEXT_PUBLIC_SITE_URL}/basvuru/${basvuruId}
  `.trim();

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Telegram API hatası:", res.status, body);
  }
}
