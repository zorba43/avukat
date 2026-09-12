import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StepIndicator from "@/components/StepIndicator";
import KisiselBilgiForm from "@/components/KisiselBilgiForm";

export const metadata: Metadata = {
  title: "Kaza Bildir · Bilgileriniz — Gökçe Hukuk Bürosu",
  description:
    "Kaza bildiriminin ilk adımı: size ulaşabilmemiz için gerekli temel bilgiler.",
};

export default function KazaBildirStep1() {
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
            <Image src="/logo.png" alt="" width={633} height={507} className="h-8 w-auto sm:h-9" />
            <span className="whitespace-nowrap font-serif text-base font-medium text-navy sm:text-lg">
              Gökçe Hukuk Bürosu
            </span>
          </Link>
        </div>
      </header>

      {/* ============================= İÇERİK ========================== */}
      <main className="mx-auto w-full max-w-[480px] px-5 py-10 sm:py-14">
        <StepIndicator current={1} />

        <div className="mt-10 rounded-card border border-line bg-paper p-6 sm:p-8">
          <h1 className="font-serif text-2xl font-medium text-navy sm:text-[1.75rem]">
            Bilgilerinizi paylaşın
          </h1>
          <p className="mt-2 text-sm text-slate">
            Size ulaşabilmemiz için gerekli temel bilgiler.
          </p>

          <KisiselBilgiForm />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-slate transition-colors duration-150 ease-out hover:text-navy"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </div>
  );
}
