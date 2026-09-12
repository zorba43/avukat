import type { Metadata } from "next";
import Link from "next/link";
import EkBelgeForm from "@/components/EkBelgeForm";

export const metadata: Metadata = {
  title: "Ek Belge Yükle — Gökçe Hukuk Bürosu",
  description:
    "Daha önce yaptığınız kaza bildirimine başvuru numaranızla eksik kalan kaza raporu ya da fotoğrafları ekleyin.",
};

export default function EkBelgeSayfasi() {
  return (
    <div className="min-h-screen bg-mist">
      {/* ============================ HEADER ============================ */}
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Gökçe Hukuk Bürosu — ana sayfa"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="" className="h-8 w-auto sm:h-9" />
            <span className="whitespace-nowrap font-serif text-base font-medium text-navy sm:text-lg">
              Gökçe Hukuk Bürosu
            </span>
          </Link>
        </div>
      </header>

      {/* ============================= İÇERİK ========================== */}
      <main className="mx-auto w-full max-w-[480px] px-5 py-10 sm:py-14">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">
          Ek Belge Yükle
        </span>

        <div className="mt-4 rounded-card border border-line bg-paper p-6 sm:p-8">
          <h1 className="font-serif text-2xl font-medium text-navy sm:text-[1.75rem]">
            Başvurunuzu bulalım
          </h1>
          <p className="mt-2 text-sm text-slate">
            Başvuru numaranız ve telefon numaranızın son 4 hanesiyle mevcut
            başvurunuza kaza raporu ya da fotoğraf ekleyebilirsiniz.
          </p>

          <EkBelgeForm />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/kaza-bildir"
            className="text-sm text-slate transition-colors duration-150 ease-out hover:text-navy"
          >
            ← Geri dön
          </Link>
        </div>
      </main>
    </div>
  );
}
