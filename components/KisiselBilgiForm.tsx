"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useKazaBildir } from "@/contexts/KazaBildirContext";

type FieldName =
  | "ad"
  | "telefon"
  | "tarih"
  | "basvuruNiteligi"
  | "kazaDurumu";

const BASVURU_NITELIGI_SECENEKLERI = [
  {
    value: "arac-sahibi-kullanmadi",
    label: "Araç Sahibiyim ama aracı ben kullanmadım",
  },
  { value: "arac-soforu", label: "Araç Şoförü" },
  { value: "hem-sahibi-hem-soforu", label: "Hem araç sahibi hem araç şoförü" },
  { value: "yolcu", label: "Yolcu" },
];

const KAZA_DURUMU_SECENEKLERI = [
  { value: "maddi", label: "Sadece maddi hasarlı" },
  { value: "hafif", label: "Maddi hasarlı ve hafif yaralanma" },
  { value: "agir", label: "Maddi hasarlı ve ağır yaralanma" },
];

/** 11 haneye kadar rakam alıp "05XX XXX XX XX" biçiminde döndürür. */
function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
    .filter(Boolean)
    .join(" ");
}

/** Yerel saat dilimine göre bugünün tarihi (YYYY-MM-DD). */
function todayLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

const inputClass = (hasError: boolean) =>
  [
    "w-full rounded-[6px] border bg-paper px-3.5 py-2.5 text-[15px] text-charcoal",
    "placeholder:text-slate/50 transition-colors duration-150 ease-out",
    "focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10",
    hasError ? "border-slate" : "border-line",
  ].join(" ");

export default function KisiselBilgiForm() {
  const router = useRouter();
  const { adim1, setAdim1 } = useKazaBildir();
  const today = useMemo(todayLocalISO, []);

  // Geri dönülürse önceki girişler kaybolmasın diye context'ten başlatılır.
  const [ad, setAd] = useState(adim1?.ad ?? "");
  const [telefon, setTelefon] = useState(
    adim1 ? formatPhone(adim1.telefon) : "",
  );
  const [tarih, setTarih] = useState(adim1?.tarih ?? "");
  const [basvuruNiteligi, setBasvuruNiteligi] = useState(
    adim1?.basvuruNiteligi ?? "",
  );
  const [kazaDurumu, setKazaDurumu] = useState(adim1?.kazaDurumu ?? "");
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    ad: false,
    telefon: false,
    tarih: false,
    basvuruNiteligi: false,
    kazaDurumu: false,
  });

  const errors = useMemo(() => {
    const e: Partial<Record<FieldName, string>> = {};

    if (ad.trim().length < 3) {
      e.ad = "Lütfen isim ve soyisminizi girin.";
    }

    const digits = telefon.replace(/\D/g, "");
    if (!/^05\d{9}$/.test(digits)) {
      e.telefon = "Geçerli bir telefon numarası girin: 05XX XXX XX XX";
    }

    if (!tarih) {
      e.tarih = "Kaza tarihini seçin.";
    } else if (tarih > today) {
      e.tarih = "İleri bir tarih seçilemez.";
    }

    if (!basvuruNiteligi) {
      e.basvuruNiteligi = "Lütfen başvuranın niteliğini seçin";
    }

    if (!kazaDurumu) {
      e.kazaDurumu = "Kaza durumunu seçin.";
    }

    return e;
  }, [ad, telefon, tarih, basvuruNiteligi, kazaDurumu, today]);

  const isValid = Object.keys(errors).length === 0;

  const markTouched = (field: FieldName) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const errorFor = (field: FieldName) =>
    touched[field] ? errors[field] : undefined;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    const data = {
      ad: ad.trim(),
      telefon: telefon.replace(/\D/g, ""),
      tarih,
      basvuruNiteligi,
      kazaDurumu,
    };
    console.log("Kaza Bildir — Adım 1 (kişisel bilgiler):", data);

    setAdim1(data);
    router.push("/kaza-bildir/yeni/ruhsat-ehliyet");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-6">
      {/* İsim Soyisim */}
      <div>
        <label htmlFor="ad" className="block text-[13px] text-slate">
          İsim Soyisim
        </label>
        <input
          id="ad"
          name="ad"
          type="text"
          autoComplete="name"
          required
          placeholder="Adınız ve soyadınız"
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          onBlur={() => markTouched("ad")}
          aria-invalid={errorFor("ad") ? true : undefined}
          aria-describedby={errorFor("ad") ? "ad-error" : undefined}
          className={`mt-1.5 ${inputClass(Boolean(errorFor("ad")))}`}
        />
        {errorFor("ad") && (
          <p id="ad-error" className="mt-1.5 text-[13px] text-urgent">
            {errorFor("ad")}
          </p>
        )}
      </div>

      {/* Telefon Numarası */}
      <div>
        <label htmlFor="telefon" className="block text-[13px] text-slate">
          Telefon Numarası
        </label>
        <input
          id="telefon"
          name="telefon"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          placeholder="05XX XXX XX XX"
          value={telefon}
          onChange={(e) => setTelefon(formatPhone(e.target.value))}
          onBlur={() => markTouched("telefon")}
          aria-invalid={errorFor("telefon") ? true : undefined}
          aria-describedby={errorFor("telefon") ? "telefon-error" : undefined}
          className={`mt-1.5 ${inputClass(Boolean(errorFor("telefon")))}`}
        />
        {errorFor("telefon") && (
          <p id="telefon-error" className="mt-1.5 text-[13px] text-urgent">
            {errorFor("telefon")}
          </p>
        )}
      </div>

      {/* Kaza Tarihi */}
      <div>
        <label htmlFor="tarih" className="block text-[13px] text-slate">
          Kaza Tarihi
        </label>
        <input
          id="tarih"
          name="tarih"
          type="date"
          required
          max={today}
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          onBlur={() => markTouched("tarih")}
          aria-invalid={errorFor("tarih") ? true : undefined}
          aria-describedby={errorFor("tarih") ? "tarih-error" : undefined}
          className={`mt-1.5 ${inputClass(Boolean(errorFor("tarih")))}`}
        />
        {errorFor("tarih") && (
          <p id="tarih-error" className="mt-1.5 text-[13px] text-urgent">
            {errorFor("tarih")}
          </p>
        )}
      </div>

      {/* Başvuranın Niteliği */}
      <fieldset
        onBlur={() => markTouched("basvuruNiteligi")}
        aria-invalid={errorFor("basvuruNiteligi") ? true : undefined}
        aria-describedby={
          errorFor("basvuruNiteligi") ? "basvuruNiteligi-error" : undefined
        }
      >
        <legend className="text-[13px] text-slate">Başvuranın Niteliği</legend>
        <div className="mt-1.5 space-y-2.5">
          {BASVURU_NITELIGI_SECENEKLERI.map((secenek) => {
            const secili = basvuruNiteligi === secenek.value;
            return (
              <label
                key={secenek.value}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-[6px] border px-4 py-3 text-[15px]",
                  "transition-colors duration-150 ease-out",
                  "focus-within:ring-2 focus-within:ring-navy/10",
                  secili
                    ? "border-navy bg-mist font-medium text-navy"
                    : "border-line bg-paper text-charcoal hover:border-slate",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="basvuruNiteligi"
                  value={secenek.value}
                  checked={secili}
                  onChange={(e) => setBasvuruNiteligi(e.target.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    secili ? "border-navy" : "border-line",
                  ].join(" ")}
                >
                  {secili && (
                    <span className="h-2 w-2 rounded-full bg-navy" />
                  )}
                </span>
                {secenek.label}
              </label>
            );
          })}
        </div>
        {errorFor("basvuruNiteligi") && (
          <p
            id="basvuruNiteligi-error"
            className="mt-1.5 text-[13px] text-urgent"
          >
            {errorFor("basvuruNiteligi")}
          </p>
        )}
      </fieldset>

      {/* Kaza Durumu */}
      <fieldset
        onBlur={() => markTouched("kazaDurumu")}
        aria-invalid={errorFor("kazaDurumu") ? true : undefined}
        aria-describedby={
          errorFor("kazaDurumu") ? "kazaDurumu-error" : undefined
        }
      >
        <legend className="text-[13px] text-slate">Kaza Durumu</legend>
        <div className="mt-1.5 space-y-2.5">
          {KAZA_DURUMU_SECENEKLERI.map((secenek) => {
            const secili = kazaDurumu === secenek.value;
            return (
              <label
                key={secenek.value}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-[6px] border px-4 py-3 text-[15px]",
                  "transition-colors duration-150 ease-out",
                  "focus-within:ring-2 focus-within:ring-navy/10",
                  secili
                    ? "border-navy bg-navy/[0.04] font-medium text-navy"
                    : "border-line text-charcoal hover:border-slate",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="kazaDurumu"
                  value={secenek.value}
                  checked={secili}
                  onChange={(e) => setKazaDurumu(e.target.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    secili ? "border-navy" : "border-line",
                  ].join(" ")}
                >
                  {secili && (
                    <span className="h-2 w-2 rounded-full bg-navy" />
                  )}
                </span>
                {secenek.label}
              </label>
            );
          })}
        </div>
        {errorFor("kazaDurumu") && (
          <p id="kazaDurumu-error" className="mt-1.5 text-[13px] text-urgent">
            {errorFor("kazaDurumu")}
          </p>
        )}
      </fieldset>

      {/* Devam Et */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={!isValid}
          className={
            isValid
              ? "cta w-full justify-center"
              : "flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[6px] bg-line px-[1.9rem] py-[0.95rem] text-[1.0625rem] font-semibold leading-none text-slate"
          }
        >
          Devam Et
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
        </button>

        <p className="mt-3 text-[13px] text-slate">
          Bilgileriniz yalnızca bu başvuru için kullanılır.
        </p>
      </div>
    </form>
  );
}
