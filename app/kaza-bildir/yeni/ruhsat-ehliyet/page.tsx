import type { Metadata } from "next";
import Link from "next/link";
import StepIndicator from "@/components/StepIndicator";
import RuhsatEhliyetForm from "@/components/RuhsatEhliyetForm";

export const metadata: Metadata = {
  title: "Kaza Bildir · Ruhsat ve Ehliyet — Gökçe Hukuk Bürosu",
  description:
    "Kaza bildiriminin ikinci adımı: araç ruhsatı ile sürücü belgenizin ön ve arka yüzü.",
};

export default function KazaBildirStep2() {
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
        <StepIndicator current={2} />

        <div className="mt-10 rounded-card border border-line bg-paper p-6 sm:p-8">
          <h1 className="font-serif text-2xl font-medium text-navy sm:text-[1.75rem]">
            Ruhsat ve ehliyetinizi yükleyin
          </h1>
          <p className="mt-2 text-sm text-slate">
            Aracınızın ruhsatı ile sürücü belgenizin ön ve arka yüzünü ekleyin —
            toplam üç fotoğraf.
          </p>

          <RuhsatEhliyetForm />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/kaza-bildir/yeni"
            className="text-sm text-slate transition-colors duration-150 ease-out hover:text-navy"
          >
            ← Önceki adım
          </Link>
        </div>
      </main>
    </div>
  );
}
