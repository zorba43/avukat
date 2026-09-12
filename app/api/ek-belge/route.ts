import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { basvuruDogrulaVeBul } from "@/lib/basvuru-dogrulama";
import { sendEkBelgeNotification } from "@/lib/telegram";

export const runtime = "nodejs";

const GENEL_HATA = "Başvuru numarası veya telefon bilgisi hatalı.";
const MAX_KAZA_RAPORU = 5;
const MAX_FOTOGRAF = 20;

type Tip = "kazaRaporu" | "fotograf";

export async function POST(request: Request) {
  let govde: {
    basvuruNo?: string;
    telefonSon4?: string;
    tip?: Tip;
    urls?: string[];
  };
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const basvuruNo = govde.basvuruNo?.trim().toUpperCase();
  const telefonSon4 = govde.telefonSon4?.trim();
  const { tip, urls } = govde;

  if (!basvuruNo || !telefonSon4) {
    return NextResponse.json({ error: GENEL_HATA }, { status: 400 });
  }
  if (tip !== "kazaRaporu" && tip !== "fotograf") {
    return NextResponse.json({ error: "Geçersiz belge türü." }, { status: 400 });
  }
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "Eklenecek dosya bulunamadı." }, { status: 400 });
  }

  // Client tarafındaki "başvurumu buldum" adımına güvenmek yerine, yazma
  // işleminden hemen önce kimlik bilgisi burada TEKRAR doğrulanır.
  const kayit = await basvuruDogrulaVeBul(basvuruNo, telefonSon4);
  if (!kayit) {
    return NextResponse.json({ error: GENEL_HATA }, { status: 404 });
  }

  const alan = tip === "kazaRaporu" ? "kazaRaporuUrls" : "fotograflarUrls";
  const maksimum = tip === "kazaRaporu" ? MAX_KAZA_RAPORU : MAX_FOTOGRAF;
  const mevcutSayi = kayit[alan].length;

  if (mevcutSayi + urls.length > maksimum) {
    return NextResponse.json(
      {
        error: `En fazla ${maksimum} ${tip === "kazaRaporu" ? "kaza raporu belgesi" : "fotoğraf"} yüklenebilir (şu an ${mevcutSayi} adet var).`,
      },
      { status: 400 },
    );
  }

  const guncellenmis = await prisma.kazaBildirimi.update({
    where: { id: kayit.id },
    data: { [alan]: { push: urls } },
  });

  try {
    await sendEkBelgeNotification({
      basvuruNo: guncellenmis.basvuruNo,
      isimSoyisim: guncellenmis.ad,
      eklenen:
        tip === "kazaRaporu"
          ? "Kaza Raporu"
          : `${urls.length} adet Fotoğraf`,
      basvuruId: guncellenmis.id,
    });
  } catch (error) {
    console.error("Telegram bildirimi gönderilirken hata:", error);
  }

  return NextResponse.json({
    ok: true,
    kazaRaporuSayisi: guncellenmis.kazaRaporuUrls.length,
    fotografSayisi: guncellenmis.fotograflarUrls.length,
  });
}
