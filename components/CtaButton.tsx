import Link from "next/link";

/**
 * Tek CTA bileşeni. --urgent rengi SADECE burada kullanılır (bkz. PROJE-SPEC
 * Bölüm 3). Sayfada birden fazla yerde çağrılsa da görsel dil aynı kalır.
 */
export default function CtaButton({
  className = "",
  label = "Kaza Bildir",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Link href="/kaza-bildir" className={`cta ${className}`}>
      {label}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
