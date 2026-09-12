"use client";

import { useEffect, useState } from "react";
import { FaLinkedin, FaInstagram, FaYoutube, FaGlobeAmericas } from "react-icons/fa";
import SosyalRozet from "@/components/SosyalRozet";

const NAV_LINKLERI = [
  { href: "#hakkimizda", label: "Hakkımızda" },
  { href: "#surec", label: "Süreç" },
  { href: "#iletisim", label: "İletişim" },
];

/**
 * lg altında (masaüstü nav + sosyal rozetlerin gizlendiği genişlik) header'da
 * görünen hamburger düğmesi + sağdan kayan mobil menü paneli. Panel açıkken
 * arka plana karartma gelir, dışarı tıklayınca/Esc/X ile kapanır.
 */
export default function MobilNavMenu() {
  const [acik, setAcik] = useState(false);

  useEffect(() => {
    if (!acik) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcik(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oncekiOverflow;
    };
  }, [acik]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        aria-label="Menüyü aç"
        aria-expanded={acik}
        aria-controls="mobil-menu-paneli"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-navy lg:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Karartma */}
      <div
        onClick={() => setAcik(false)}
        aria-hidden="true"
        className={[
          "fixed inset-0 z-40 bg-navy-deep/40 transition-opacity duration-[250ms] ease-out lg:hidden",
          acik ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Panel */}
      <div
        id="mobil-menu-paneli"
        role="dialog"
        aria-modal="true"
        aria-hidden={!acik}
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-[min(320px,85vw)] flex-col bg-paper p-6",
          "shadow-[-8px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-[250ms] ease-out lg:hidden",
          acik ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setAcik(false)}
            aria-label="Menüyü kapat"
            className="flex h-8 w-8 items-center justify-center text-navy"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="mt-2 flex flex-col">
          {NAV_LINKLERI.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setAcik(false)}
              className="flex min-h-[44px] items-center text-base font-medium text-navy transition-colors duration-150 ease-out hover:text-amber"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 border-t border-line pt-5">
          <div className="flex items-center gap-4">
            <SosyalRozet href="#" label="LinkedIn" size={40} className="bg-[#0A66C2] text-white">
              <FaLinkedin className="h-[18px] w-[18px]" />
            </SosyalRozet>
            <SosyalRozet
              href="#"
              label="Instagram"
              size={40}
              className="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white"
            >
              <FaInstagram className="h-[18px] w-[18px]" />
            </SosyalRozet>
            <SosyalRozet href="#" label="YouTube" size={40} className="bg-[#FF0000] text-white">
              <FaYoutube className="h-[18px] w-[18px]" />
            </SosyalRozet>
            <SosyalRozet href="/" label="Web sitesi" size={40} className="bg-navy text-amber" internal>
              <FaGlobeAmericas className="h-[18px] w-[18px]" />
            </SosyalRozet>
          </div>
        </div>
      </div>
    </>
  );
}
