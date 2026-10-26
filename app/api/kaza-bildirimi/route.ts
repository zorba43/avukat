import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendKazaBildirimNotification } from "@/lib/telegram";
import { uretBasvuruNo } from "@/lib/basvuru";
import { gecerliTalepMi } from "@/lib/talepler";

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
  karsiTarafRuhsatUrl?: string;
  karsiTarafEhliyetOnUrl?: string;
  karsiTarafEhliyetArkaUrl?: string;
  kazaRaporuUrls: string[];
  fotograflarUrls: string[];
  ifadeUrls?: string[];
  saglikRaporuUrls?: string[];
  digerEvrakUrls?: string[];
  talepler: string[];
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
  // Olay yeri fotoğrafları ve ek belgeler opsiyonel — dizi değilse boş kabul edilir.
  const diziYap = (deger: unknown) =>
    Array.isArray(deger) ? deger.filter((u): u is string => typeof u === "string") : [];
  const fotograflarUrls = diziYap(govde.fotograflarUrls);
  const ifadeUrls = diziYap(govde.ifadeUrls);
  const saglikRaporuUrls = diziYap(govde.saglikRaporuUrls);
  const digerEvrakUrls = diziYap(govde.digerEvrakUrls);

  const talepler = Array.isArray(govde.talepler)
    ? Array.from(new Set(govde.talepler.filter(gecerliTalepMi)))
    : [];
  if (talepler.length === 0) {
    return NextResponse.json({ error: "En az bir talep seçilmeli." }, { status: 400 });
  }

  // basvuruNo çakışırsa (Prisma P2002, @unique) birkaç kez yeniden üretip dener.
  let kayit;
  for (let deneme = 0; ; deneme++) {
    try {
      kayit = await prisma.kazaBildirimi.create({
        data: {
          id: govde.id!,
          basvuruNo: uretBasvuruNo(),
          ad: govde.ad!,
          telefon: govde.telefon!,
          kazaTarihi: new Date(govde.tarih!),
          basvuruNiteligi: govde.basvuruNiteligi!,
          kazaDurumu: govde.kazaDurumu!,
          ruhsatUrl: govde.ruhsatUrl!,
          ehliyetOnUrl: govde.ehliyetOnUrl!,
          ehliyetArkaUrl: govde.ehliyetArkaUrl!,
          karsiTarafRuhsatUrl: govde.karsiTarafRuhsatUrl || null,
          karsiTarafEhliyetOnUrl: govde.karsiTarafEhliyetOnUrl || null,
          karsiTarafEhliyetArkaUrl: govde.karsiTarafEhliyetArkaUrl || null,
          kazaRaporuUrls: govde.kazaRaporuUrls!,
          fotograflarUrls,
          ifadeUrls,
          saglikRaporuUrls,
          digerEvrakUrls,
          talepler,
          kaynak: govde.kaynak!,
          kaynakDetay: govde.kaynakDetay || null,
        },
      });
      break;
    } catch (error) {
      const carpisma =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        (error.meta?.target as string[] | undefined)?.includes("basvuruNo");
      if (carpisma && deneme < 5) continue;
      throw error;
    }
  }

  try {
    await sendKazaBildirimNotification({
      isimSoyisim: kayit.ad,
      telefon: kayit.telefon,
      kazaTarihi: kayit.kazaTarihi,
      basvuruNiteligi: kayit.basvuruNiteligi,
      basvuruId: kayit.id,
      karsiTarafVarMi: Boolean(
        kayit.karsiTarafRuhsatUrl ||
          kayit.karsiTarafEhliyetOnUrl ||
          kayit.karsiTarafEhliyetArkaUrl,
      ),
      ifadeSayisi: kayit.ifadeUrls.length,
      saglikRaporuSayisi: kayit.saglikRaporuUrls.length,
      digerEvrakSayisi: kayit.digerEvrakUrls.length,
      talepler: kayit.talepler,
    });
  } catch (error) {
    // Telegram bildirimi başarısız olsa bile başvuru kaydedilmiş sayılır.
    console.error("Telegram bildirimi gönderilirken hata:", error);
  }

  return NextResponse.json({ id: kayit.id, basvuruNo: kayit.basvuruNo });
}
