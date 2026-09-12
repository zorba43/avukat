import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendKazaBildirimNotification } from "@/lib/telegram";

export const runtime = "nodejs";

type Govde = {
  id: string;
  ad: string;
  telefon: string;
  tarih: string;
  basvuruNiteligi: string;
  kazaDurumu: string;
  ruhsatUrl: string;
  ehliyetOnUrl: string;
  ehliyetArkaUrl: string;
  kazaRaporuUrls: string[];
  fotograflarUrls: string[];
  kaynak: string;
  kaynakDetay?: string;
};

function eksikAlan(govde: Partial<Govde>) {
  const zorunlu: (keyof Govde)[] = [
    "id",
    "ad",
    "telefon",
    "tarih",
    "basvuruNiteligi",
    "kazaDurumu",
    "ruhsatUrl",
    "ehliyetOnUrl",
    "ehliyetArkaUrl",
    "kaynak",
  ];
  return zorunlu.find((alan) => !govde[alan]);
}

export async function POST(request: Request) {
  let govde: Partial<Govde>;
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const eksik = eksikAlan(govde);
  if (eksik) {
    return NextResponse.json({ error: `Eksik alan: ${eksik}` }, { status: 400 });
  }
  if (!Array.isArray(govde.kazaRaporuUrls) || govde.kazaRaporuUrls.length < 1) {
    return NextResponse.json(
      { error: "En az bir kaza raporu belgesi gerekli." },
      { status: 400 },
    );
  }
  if (!Array.isArray(govde.fotograflarUrls) || govde.fotograflarUrls.length < 3) {
    return NextResponse.json(
      { error: "En az 3 olay yeri fotoğrafı gerekli." },
      { status: 400 },
    );
  }

  const kayit = await prisma.kazaBildirimi.create({
    data: {
      id: govde.id!,
      ad: govde.ad!,
      telefon: govde.telefon!,
      kazaTarihi: new Date(govde.tarih!),
      basvuruNiteligi: govde.basvuruNiteligi!,
      kazaDurumu: govde.kazaDurumu!,
      ruhsatUrl: govde.ruhsatUrl!,
      ehliyetOnUrl: govde.ehliyetOnUrl!,
      ehliyetArkaUrl: govde.ehliyetArkaUrl!,
      kazaRaporuUrls: govde.kazaRaporuUrls!,
      fotograflarUrls: govde.fotograflarUrls!,
      kaynak: govde.kaynak!,
      kaynakDetay: govde.kaynakDetay || null,
    },
  });

  try {
    await sendKazaBildirimNotification({
      isimSoyisim: kayit.ad,
      telefon: kayit.telefon,
      kazaTarihi: kayit.kazaTarihi,
      basvuruNiteligi: kayit.basvuruNiteligi,
      basvuruId: kayit.id,
    });
  } catch (error) {
    // Telegram bildirimi başarısız olsa bile başvuru kaydedilmiş sayılır.
    console.error("Telegram bildirimi gönderilirken hata:", error);
  }

  return NextResponse.json({ id: kayit.id });
}
