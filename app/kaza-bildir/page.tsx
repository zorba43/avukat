import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kaza Bildir — Gökçe Hukuk Bürosu",
  description:
    "Yeni bir kaza bildirimi başlatın ya da mevcut başvurunuza belge ekleyin.",
};

function IconYeniBasvuru() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M12 12v6M9 15h6" />
    </svg>
  );
}

function IconEkBelge() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13.5 6.5 17 3l4 4-3.5 3.5" />
      <path d="M9 21H4a1 1 0 0 1-1-1v-5l9.5-9.5 6 6L9 21z" />
      <path d="M14 7l3 3" />
    </svg>
  );
}

const SECENEKLER = [
  {
    href: "/kaza-bildir/yeni",
    Icon: IconYeniBasvuru,
    baslik: "Yeni Kaza Bildir",
    aciklama:
      "Henüz başvuru oluşturmadıysanız buradan başlayın — kişisel bilgileriniz, kaza raporunuz ve fotoğraflarınızla birlikte yeni bir bildirim oluşturun.",
  },
  {
    href: "/kaza-bildir/ek-belge",
    Icon: IconEkBelge,
    baslik: "Başvuru Numarasıyla Ek Belge Yükle",
    aciklama:
      "Daha önce bildirim yaptıysanız ve eksik kalan bir kaza raporu ya da fotoğraf eklemek istiyorsanız, başvuru numaranızla buradan devam edin.",
  },
];

export default function KazaBildirSecim() {
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
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">
          Kaza Bildir
        </span>
        <h1 className="mt-3 font-serif text-3xl font-medium text-navy sm:text-4xl">
          Nasıl devam etmek istersiniz?
        </h1>
        <p className="mt-3 max-w-prose text-slate">
          Yeni bir kaza bildirimi mi oluşturacaksınız, yoksa daha önceki bir
          başvurunuza belge mi ekleyeceksiniz?
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {SECENEKLER.map(({ href, Icon, baslik, aciklama }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-card border border-line bg-paper p-7 transition-colors duration-150 ease-out hover:border-slate"
            >
              <span className="flex h-11 w-11 items-center justify-center text-amber">
                <Icon />
              </span>
              <h2 className="mt-5 text-xl">{baslik}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                {aciklama}
              </p>
              <span className="mt-5 flex items-center gap-2 text-sm font-medium text-navy">
                Devam et
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
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
