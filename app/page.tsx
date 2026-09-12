import Image from "next/image";
import Link from "next/link";
import { FaLinkedin, FaInstagram, FaYoutube, FaGlobeAmericas } from "react-icons/fa";
import CtaButton from "@/components/CtaButton";
import SosyalRozet from "@/components/SosyalRozet";
import MobilNavMenu from "@/components/MobilNavMenu";

const PHONE_DISPLAY = "+90 (533) 427 55 73";
const PHONE_HREF = "tel:+905334275573";
const EMAIL = "info@gokcehukuk.com";

// Harita — büro konumu (Google Maps embed, API anahtarı gerektirmez).
const MAP_LABEL =
  "Elmalı, 1. Sk. Karabayır İş Merkezi No:17, Ofis 62-63-64, 07040 Muratpaşa/Antalya";
const MAP_QUERY =
  "Karabayır İş Merkezi, Elmalı 1. Sokak No:17, 07040 Muratpaşa/Antalya";
const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(MAP_QUERY) +
  "&z=16&output=embed";

/* --------------------------------------------------------------------------- */
/*  İkonlar — amber, ince stroke (PROJE-SPEC Bölüm 3: ikonlar --amber)         */
/* --------------------------------------------------------------------------- */

function IconForm() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13l2 2 4-4" />
    </svg>
  );
}

function IconPhoto() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m21 16-4.5-4.5L7 21" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconScale() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v18M7 21h10M6 7h12M6 7l-3 6a3 3 0 0 0 6 0zM18 7l-3 6a3 3 0 0 0 6 0z" />
    </svg>
  );
}

/* --------------------------------------------------------------------------- */

const STATS = [
  { value: "500+", label: "sonuçlanmış dosya" },
  { value: "1 saat", label: "ortalama ilk yanıt" },
  { value: "7/24", label: "bildirim kabulü" },
  { value: "%0", label: "ön ücret" },
];

const STEPS = [
  {
    n: "01",
    title: "Bilgilerinizi girin",
    body: "İsim, telefon ve kaza tarihi. Bir dakikadan kısa sürer, kayıt gerekmez.",
    Icon: IconForm,
  },
  {
    n: "02",
    title: "Kaza raporunu yükleyin",
    body: "Trafik kazası tespit tutanağını PDF veya fotoğraf olarak ekleyin.",
    Icon: IconDoc,
  },
  {
    n: "03",
    title: "Fotoğrafları ekleyin",
    body: "Kaza yerine ve araca ait fotoğrafları yükleyin — en fazla 10 adet.",
    Icon: IconPhoto,
  },
];

const TRUST = [
  {
    title: "Bilgileriniz gizli kalır",
    body: "Yüklediğiniz belgeler yalnızca dosyanızı takip eden avukatla paylaşılır, üçüncü kişilere aktarılmaz.",
    Icon: IconLock,
  },
  {
    title: "Aynı gün geri dönüş",
    body: "Bildiriminiz büroya anında ulaşır; en geç bir saat içinde sizi arayıp süreci anlatırız.",
    Icon: IconClock,
  },
  {
    title: "Uzman avukat takibi",
    body: "Kurye ve trafik kazası tazminatı davalarında deneyimli bir avukat dosyanızı baştan sona yürütür.",
    Icon: IconScale,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      {/* ============================ HEADER ============================ */}
      <header className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4 md:px-8">
          {/* Sol: logo. col-start-* sabitleri: nav mobilde display:none olunca
              grid auto-placement diğer öğeleri sola kaydırmasın diye şart. */}
          <Link
            href="/"
            className="col-start-1 flex items-center justify-self-start gap-2.5"
            aria-label="Gökçe Hukuk Bürosu — ana sayfa"
          >
            <Image
              src="/logo.png"
              alt=""
              width={633}
              height={507}
              priority
              className="h-8 w-auto sm:h-9 md:h-10"
            />
            <span className="whitespace-nowrap font-serif text-base font-medium text-navy sm:text-lg md:text-xl">
              Gökçe Hukuk Bürosu
            </span>
          </Link>

          {/* Orta: nav — header genişliğinde tam ortalanmış (md ve üstü) */}
          <nav className="col-start-2 hidden items-center gap-8 lg:flex">
            <a
              href="#hakkimizda"
              className="text-sm font-medium text-navy transition-colors duration-150 ease-out hover:text-amber"
            >
              Hakkımızda
            </a>
            <a
              href="#surec"
              className="text-sm font-medium text-navy transition-colors duration-150 ease-out hover:text-amber"
            >
              Süreç
            </a>
            <a
              href="#iletisim"
              className="text-sm font-medium text-navy transition-colors duration-150 ease-out hover:text-amber"
            >
              İletişim
            </a>
          </nav>

          {/* Sağ: sosyal rozetler + telefon */}
          <div className="col-start-3 flex items-center justify-self-end gap-5">
            <div className="hidden items-center gap-[10px] lg:flex">
              {/* Placeholder linkler — gerçek hesaplar eklenince href güncellenip
                  target="_blank" rel="noopener noreferrer" eklenecek. */}
              <SosyalRozet href="#" label="LinkedIn" className="bg-[#0A66C2] text-white">
                <FaLinkedin className="h-4 w-4" />
              </SosyalRozet>
              <SosyalRozet
                href="#"
                label="Instagram"
                className="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white"
              >
                <FaInstagram className="h-4 w-4" />
              </SosyalRozet>
              <SosyalRozet href="#" label="YouTube" className="bg-[#FF0000] text-white">
                <FaYoutube className="h-4 w-4" />
              </SosyalRozet>
              <SosyalRozet href="/" label="Web sitesi" className="bg-navy text-amber" internal>
                <FaGlobeAmericas className="h-4 w-4" />
              </SosyalRozet>
            </div>

            <a
              href={PHONE_HREF}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-navy md:text-base"
              aria-label={`Telefon: ${PHONE_DISPLAY}`}
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-white",
                  "border border-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
                  "transition-[transform,box-shadow] duration-150 ease-out",
                  "hover:scale-[1.08] hover:shadow-[0_4px_14px_rgba(0,0,0,0.18)]",
                ].join(" ")}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
            </a>

            <MobilNavMenu />
          </div>
        </div>
      </header>

      {/* ============================= HERO ============================= */}
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero.webp" alt="" className="hero-photo" />
        <div className="hero-scrim" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-6xl flex-col justify-center px-5 py-20 md:px-8">
          <div className="max-w-xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white/80">
              <span className="live-dot" />
              Şu anda bildirim alıyoruz
            </span>

            <h1 className="text-[2.15rem] leading-[1.12] text-white sm:text-5xl md:text-[3.25rem]">
              Kazanızı bildirin, haklarınızı biz koruyalım.
            </h1>

            <p className="mt-5 max-w-prose text-base leading-relaxed text-white/80 md:text-lg">
              Trafik kazası geçiren kuryeler için hazırlanmış hızlı bildirim
              sistemi. Kaza raporunuzu ve fotoğraflarınızı yükleyin; tazminat
              sürecini uzman avukatımız yürütsün.
            </p>

            <div className="mt-8">
              <CtaButton />
            </div>

            <p className="mt-4 text-sm text-white/60">
              Ön ücret yok — değerlendirme ücretsizdir.
            </p>
          </div>
        </div>
      </section>

      {/* ========================== GÜVEN ÇUBUĞU ======================== */}
      <section className="border-b border-line bg-navy">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-10 md:grid-cols-4 md:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-serif text-3xl font-medium text-white md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ SÜREÇ ============================= */}
      <section id="surec" className="steps relative isolate overflow-hidden bg-navy-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/2.webp" alt="" className="steps-photo" />
        <div className="steps-scrim" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">
            Nasıl işliyor
          </span>
          <h2 className="mt-3 text-3xl text-white md:text-4xl">
            Üç adımda kaza bildirimi
          </h2>
          <p className="mt-4 max-w-prose text-white/70">
            Akış, kaza sonrası telaşlı bir anda bile tamamlanabilecek kadar
            kısa tutuldu. Her adımı ayrı ayrı, kendi hızınızda doldurabilirsiniz.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ n, title, body, Icon }) => (
              <div
                key={n}
                className="flex flex-col rounded-card border border-line bg-paper p-7 shadow-[0_18px_40px_-20px_rgba(13,21,38,0.55)]"
              >
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 text-amber">
                    <Icon />
                  </span>
                  <span className="font-serif text-2xl font-medium text-line">
                    {n}
                  </span>
                </div>
                <h3 className="mt-5 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== ÖZELLİK / NEDEN BİZ ======================= */}
      <section
        id="hakkimizda"
        className="relative isolate overflow-hidden border-y border-line bg-paper"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/3.webp" alt="" className="trust-photo" />
        <div className="trust-scrim" />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">
              Neden bize güvenmelisiniz
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl">
              Kurye kazalarında yalnız değilsiniz
            </h2>
            <p className="mt-4 max-w-prose text-slate">
              Gökçe Hukuk Bürosu, kurye ve motokurye kazalarından doğan tazminat
              davalarında uzmanlaşmıştır. Siz iyileşmeye odaklanın; belgelerin
              toplanması, sigorta yazışmaları ve dava süreci bize kalsın.
            </p>
            <div className="mt-8">
              <Link
                href="#iletisim"
                className="text-sm font-medium text-navy underline decoration-line underline-offset-4 transition-colors hover:decoration-navy"
              >
                Büro ile iletişime geçin
              </Link>
            </div>
          </div>

          <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-paper/75 px-6 backdrop-blur-[2px] md:px-8">
            {TRUST.map(({ title, body, Icon }) => (
              <li key={title} className="flex gap-4 py-6">
                <span className="mt-0.5 h-6 w-6 shrink-0 text-amber">
                  <Icon />
                </span>
                <div>
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =========================== ALT CTA =========================== */}
      <section className="bg-navy-deep">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center md:px-8 md:py-24">
          <h2 className="mx-auto max-w-2xl text-3xl text-white md:text-4xl">
            Kazanız yeni olduysa, süreç bugün başlamalı.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-white/70">
            Zaman aşımı ve delil kaybı hak kayıplarına yol açar. Bildiriminizi
            şimdi oluşturun, gerisini biz takip edelim.
          </p>
          <div className="mt-8 flex justify-center">
            <CtaButton />
          </div>
        </div>
      </section>

      {/* =========================== FOOTER =========================== */}
      <footer id="iletisim" className="bg-navy-deep text-white/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:gap-14 md:px-8 md:py-16">
          {/* İletişim */}
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={633} height={507} className="h-9 w-auto" />
              <span className="font-serif text-lg font-medium text-white">
                Gökçe Hukuk Bürosu
              </span>
            </div>

            <dl className="mt-8 space-y-4 text-sm">
              <div className="flex gap-3">
                <dt className="mt-0.5 h-5 w-5 shrink-0 text-amber" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </dt>
                <dd className="text-white/70">{MAP_LABEL}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="mt-0.5 h-5 w-5 shrink-0 text-amber" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </dt>
                <dd>
                  <a href={PHONE_HREF} className="text-white/70 transition-colors hover:text-white">
                    {PHONE_DISPLAY}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="mt-0.5 h-5 w-5 shrink-0 text-amber" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </dt>
                <dd>
                  <a href={`mailto:${EMAIL}`} className="text-white/70 transition-colors hover:text-white">
                    {EMAIL}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Harita — dark mod */}
          <div className="overflow-hidden rounded-card border border-white/10">
            <iframe
              src={MAP_EMBED_SRC}
              title="Gökçe Hukuk Bürosu konumu"
              className="map-frame block h-[260px] w-full md:h-full md:min-h-[280px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-5 text-xs text-white/50 md:px-8">
            © {new Date().getFullYear()} Gökçe Hukuk Bürosu. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
