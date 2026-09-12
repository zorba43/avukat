import { NextResponse } from "next/server";
import { basvuruDogrulaVeBul } from "@/lib/basvuru-dogrulama";

export const runtime = "nodejs";

const GENEL_HATA = "Başvuru numarası veya telefon bilgisi hatalı.";

function maskeleTelefon(raw: string) {
  const d = raw.replace(/\D/g, "");
  return `${d.slice(0, 2)}XX XXX XX ${d.slice(-2)}`;
}

export async function POST(request: Request) {
  let govde: { basvuruNo?: string; telefonSon4?: string };
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const basvuruNo = govde.basvuruNo?.trim().toUpperCase();
  const telefonSon4 = govde.telefonSon4?.trim();

  if (!basvuruNo || !telefonSon4 || !/^\d{4}$/.test(telefonSon4)) {
    return NextResponse.json({ error: GENEL_HATA }, { status: 400 });
  }

  const kayit = await basvuruDogrulaVeBul(basvuruNo, telefonSon4);
  if (!kayit) {
    return NextResponse.json({ error: GENEL_HATA }, { status: 404 });
  }

  return NextResponse.json({
    // id + createdAt, istemcinin Blob klasör yolunu (bkz. lib/basvuru.ts
    // basvuruKlasoru) ilk yüklemeyle AYNI formülle yeniden hesaplayabilmesi
    // için gerekli — /basvuru/[id] linki zaten herkese açık olduğundan bu
    // bilgiler ek bir gizlilik riski oluşturmaz.
    id: kayit.id,
    createdAt: kayit.createdAt,
    ad: kayit.ad,
    telefonMaskeli: maskeleTelefon(kayit.telefon),
    kazaTarihi: kayit.kazaTarihi,
    basvuruNiteligi: kayit.basvuruNiteligi,
    kazaRaporuSayisi: kayit.kazaRaporuUrls.length,
    fotografSayisi: kayit.fotograflarUrls.length,
  });
}
