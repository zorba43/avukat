import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Kaza Bildirimi Detayı — Gökçe Hukuk Bürosu",
  robots: { index: false },
};

function formatTelefon(raw: string) {
  const d = raw.replace(/\D/g, "");
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
    .filter(Boolean)
    .join(" ");
}

function formatTarih(tarih: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(tarih);
}

const BASVURU_NITELIGI_ETIKETI: Record<string, string> = {
  "arac-sahibi-kullanmadi": "Araç Sahibiyim ama aracı ben kullanmadım",
  "arac-soforu": "Araç Şoförü",
  "hem-sahibi-hem-soforu": "Hem araç sahibi hem araç şoförü",
  yolcu: "Yolcu",
};

const KAZA_DURUMU_ETIKETI: Record<string, string> = {
  maddi: "Sadece maddi hasarlı",
  hafif: "Maddi hasarlı ve hafif yaralanma",
  agir: "Maddi hasarlı ve ağır yaralanma",
};

const KAYNAK_ETIKETI: Record<string, string> = {
  sosyal: "Sosyal Medya",
  arkadas: "Arkadaş Tavsiyesi",
  diger: "Diğer",
};

function dosyaAdi(url: string) {
  try {
    const { pathname } = new URL(url);
    return decodeURIComponent(pathname.split("/").pop() || url);
  } catch {
    return url;
  }
}

function pdfMi(url: string) {
  return /\.pdf($|\?)/i.test(url);
}

export default async function BasvuruDetay({
  params,
}: {
  params: { id: string };
}) {
  const basvuru = await prisma.kazaBildirimi.findUnique({
    where: { id: params.id },
  });

  if (!basvuru) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-mist">
      {/* ============================ HEADER ============================ */}
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-4xl items-center px-5 py-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Gökçe Hukuk Bürosu — ana sayfa"
          >
            <Image src="/logo.png" alt="" width={633} height={507} className="h-8 w-auto sm:h-9" />
            <span className="whitespace-nowrap font-serif text-base font-medium text-navy sm:text-lg">
              Gökçe Hukuk Bürosu
            </span>
          </Link>
        </div>
      </header>

      {/* ============================= İÇERİK ========================== */}
      <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:py-14">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">
          Başvuru
        </span>
        <h1 className="mt-3 font-serif text-3xl font-medium text-navy sm:text-4xl">
          Kaza Bildirimi Detayı
        </h1>
        <p className="mt-2 text-sm text-slate">
          Başvuru No:{" "}
          <span className="font-medium text-charcoal">{basvuru.basvuruNo}</span>
          {" · "}Bildirim tarihi: {formatTarih(basvuru.createdAt)}
        </p>

        {/* Kişisel bilgiler */}
        <section className="mt-8 rounded-card border border-line bg-paper p-6 sm:p-8">
          <h2 className="font-serif text-xl font-medium text-navy">
            Bildiren Bilgileri
          </h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-slate">İsim Soyisim</dt>
              <dd className="mt-1 text-[15px] text-charcoal">{basvuru.ad}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-slate">Telefon</dt>
              <dd className="mt-1 text-[15px] text-charcoal">
                <a
                  href={`tel:+90${basvuru.telefon.replace(/\D/g, "").slice(-10)}`}
                  className="transition-colors duration-150 ease-out hover:text-navy"
                >
                  {formatTelefon(basvuru.telefon)}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-slate">Kaza Tarihi</dt>
              <dd className="mt-1 text-[15px] text-charcoal">
                {formatTarih(basvuru.kazaTarihi)}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-slate">Başvuranın Niteliği</dt>
              <dd className="mt-1 text-[15px] text-charcoal">
                {BASVURU_NITELIGI_ETIKETI[basvuru.basvuruNiteligi] ??
                  basvuru.basvuruNiteligi}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-slate">Kaza Durumu</dt>
              <dd className="mt-1 text-[15px] text-charcoal">
                {KAZA_DURUMU_ETIKETI[basvuru.kazaDurumu] ?? basvuru.kazaDurumu}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-slate">Bize Nasıl Ulaştı</dt>
              <dd className="mt-1 text-[15px] text-charcoal">
                {KAYNAK_ETIKETI[basvuru.kaynak] ?? basvuru.kaynak}
                {basvuru.kaynakDetay ? ` — ${basvuru.kaynakDetay}` : ""}
              </dd>
            </div>
          </dl>
        </section>

        {/* Ruhsat & Ehliyet */}
        <section className="mt-6 rounded-card border border-line bg-paper p-6 sm:p-8">
          <h2 className="font-serif text-xl font-medium text-navy">
            Ruhsat &amp; Ehliyet
          </h2>

          <h3 className="mt-5 text-[13px] font-semibold text-navy">
            Sizin Belgeleriniz
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { baslik: "Araç Ruhsatı", url: basvuru.ruhsatUrl },
              { baslik: "Ehliyet — Ön Yüz", url: basvuru.ehliyetOnUrl },
              { baslik: "Ehliyet — Arka Yüz", url: basvuru.ehliyetArkaUrl },
            ].map((belge) => (
              <a
                key={belge.baslik}
                href={belge.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-[6px] border border-line"
              >
                <div className="aspect-square overflow-hidden bg-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={belge.url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-150 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="px-2.5 py-2 text-[12px] text-slate group-hover:text-navy">
                  {belge.baslik}
                </div>
              </a>
            ))}
          </div>

          <h3 className="mt-6 text-[13px] font-semibold text-slate">
            Karşı Taraf Belgeleri
          </h3>
          {(() => {
            const karsiTarafBelgeler = [
              { baslik: "Karşı Taraf Araç Ruhsatı", url: basvuru.karsiTarafRuhsatUrl },
              {
                baslik: "Karşı Taraf Ehliyeti — Ön Yüz",
                url: basvuru.karsiTarafEhliyetOnUrl,
              },
              {
                baslik: "Karşı Taraf Ehliyeti — Arka Yüz",
                url: basvuru.karsiTarafEhliyetArkaUrl,
              },
            ].filter((belge): belge is { baslik: string; url: string } => Boolean(belge.url));

            if (karsiTarafBelgeler.length === 0) {
              return <p className="mt-2 text-[13px] text-slate">Belge eklenmedi.</p>;
            }

            return (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {karsiTarafBelgeler.map((belge) => (
                  <a
                    key={belge.baslik}
                    href={belge.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-[6px] border border-line"
                  >
                    <div className="aspect-square overflow-hidden bg-mist">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={belge.url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-150 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="px-2.5 py-2 text-[12px] text-slate group-hover:text-navy">
                      {belge.baslik}
                    </div>
                  </a>
                ))}
              </div>
            );
          })()}
        </section>

        {/* Kaza raporu */}
        <section className="mt-6 rounded-card border border-line bg-paper p-6 sm:p-8">
          <h2 className="font-serif text-xl font-medium text-navy">
            Kaza Raporu
          </h2>
          <ul className="mt-5 space-y-2.5">
            {basvuru.kazaRaporuUrls.map((url, i) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[6px] border border-line px-4 py-3 text-[14px] text-charcoal transition-colors duration-150 ease-out hover:border-slate hover:text-navy"
                >
                  <svg
                    className="h-5 w-5 shrink-0 text-amber"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {pdfMi(url) ? (
                      <>
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                        <path d="M14 3v5h5" />
                      </>
                    ) : (
                      <>
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="8.5" cy="10" r="1.5" />
                        <path d="m21 16-4.5-4.5L7 21" />
                      </>
                    )}
                  </svg>
                  <span className="min-w-0 flex-1 truncate">
                    Belge {i + 1} — {dosyaAdi(url)}
                  </span>
                  <span className="shrink-0 text-[12px] text-slate">Görüntüle ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Olay yeri fotoğrafları */}
        <section className="mt-6 rounded-card border border-line bg-paper p-6 sm:p-8">
          <h2 className="font-serif text-xl font-medium text-navy">
            Olay Yeri Fotoğrafları
            <span className="ml-2 font-sans text-sm font-normal text-slate">
              ({basvuru.fotograflarUrls.length})
            </span>
          </h2>
          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
            {basvuru.fotograflarUrls.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block aspect-square overflow-hidden rounded-[6px] border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Olay yeri fotoğrafı ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-150 ease-out group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
