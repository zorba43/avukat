"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { useKazaBildir } from "@/contexts/KazaBildirContext";

const KAYNAK_SECENEKLERI = [
  { value: "sosyal", label: "Sosyal Medya" },
  { value: "arkadas", label: "Arkadaş Tavsiyesi" },
  { value: "diger", label: "Diğer" },
];

/** Dosyayı tarayıcıdan doğrudan Vercel Blob'a yükler (sunucu fonksiyonundan geçmez). */
function blobaYukle(file: File, pathname: string) {
  return upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
  }).then((blob) => blob.url);
}

export default function TamamlaForm() {
  const router = useRouter();
  const { adim1, adim2, adim3, adim4, adim5, setAdim5 } = useKazaBildir();

  const [kaynak, setKaynak] = useState(adim5?.kaynak ?? "");
  const [digerMetin, setDigerMetin] = useState(adim5?.kaynakDetay ?? "");
  const [dokunuldu, setDokunuldu] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderimHatasi, setGonderimHatasi] = useState<string | null>(null);
  const [gonderildi, setGonderildi] = useState(false);

  // Sayfa doğrudan açıldıysa ya da yenilendiyse (context sıfırlanır) önceki
  // adımlar eksik demektir — akışı baştan başlat.
  useEffect(() => {
    if (!adim1 || !adim2 || adim3.length === 0 || adim4.length < 3) {
      router.replace("/kaza-bildir");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const digerSecili = kaynak === "diger";

  const hata = useMemo(() => {
    if (!kaynak) return "Bize nasıl ulaştığınızı seçin.";
    if (digerSecili && digerMetin.trim().length === 0) {
      return "Lütfen kısaca belirtin.";
    }
    return undefined;
  }, [kaynak, digerSecili, digerMetin]);

  const gecerli = !hata;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDokunuldu(true);
    if (!gecerli || gonderiliyor) return;

    const adim5Verisi = {
      kaynak,
      kaynakDetay: digerSecili ? digerMetin.trim() : undefined,
    };
    setAdim5(adim5Verisi);
    setGonderimHatasi(null);
    setGonderiliyor(true);

    try {
      // Bu id hem Blob klasör öneki hem de veritabanı birincil anahtarı hem de
      // /basvuru/[id] linkinin tahmin edilemez parçası olarak kullanılır.
      const id = crypto.randomUUID();

      const [ruhsatUrl, ehliyetOnUrl, ehliyetArkaUrl, kazaRaporuUrls, fotograflarUrls] =
        await Promise.all([
          blobaYukle(adim2!.ruhsat, `basvurular/${id}/ruhsat/${adim2!.ruhsat.name}`),
          blobaYukle(
            adim2!.ehliyetOn,
            `basvurular/${id}/ehliyet-on/${adim2!.ehliyetOn.name}`,
          ),
          blobaYukle(
            adim2!.ehliyetArka,
            `basvurular/${id}/ehliyet-arka/${adim2!.ehliyetArka.name}`,
          ),
          Promise.all(
            adim3.map((f, i) =>
              blobaYukle(f, `basvurular/${id}/kaza-raporu/${i}-${f.name}`),
            ),
          ),
          Promise.all(
            adim4.map((f, i) =>
              blobaYukle(f, `basvurular/${id}/fotograflar/${i}-${f.name}`),
            ),
          ),
        ]);

      const res = await fetch("/api/kaza-bildirimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ad: adim1!.ad,
          telefon: adim1!.telefon,
          tarih: adim1!.tarih,
          kazaDurumu: adim1!.kazaDurumu,
          ruhsatUrl,
          ehliyetOnUrl,
          ehliyetArkaUrl,
          kazaRaporuUrls,
          fotograflarUrls,
          kaynak: adim5Verisi.kaynak,
          kaynakDetay: adim5Verisi.kaynakDetay,
        }),
      });

      if (!res.ok) {
        const govde = await res.json().catch(() => ({}));
        throw new Error(govde.error || "Gönderim başarısız oldu.");
      }

      setGonderildi(true);
    } catch (err) {
      console.error("Kaza Bildir — gönderim hatası:", err);
      setGonderimHatasi(
        "Bildiriminiz gönderilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.",
      );
    } finally {
      setGonderiliyor(false);
    }
  }

  if (!adim1 || !adim2 || adim3.length === 0 || adim4.length < 3) {
    return null;
  }

  if (gonderildi) {
    return (
      <div className="mt-7 flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="font-serif text-xl font-medium text-navy">
          Bildiriminiz alındı
        </h2>
        <p className="max-w-[32ch] text-sm text-slate">
          Dosyalarınızı inceleyip en kısa sürede sizinle iletişime geçeceğiz.
        </p>
        <Link
          href="/"
          className="mt-2 text-sm font-medium text-navy underline decoration-line underline-offset-4 transition-colors duration-150 ease-out hover:decoration-navy"
        >
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7">
      <fieldset>
        <legend className="text-[13px] text-slate">Bize nasıl ulaştınız?</legend>
        <div className="mt-1.5 space-y-2.5">
          {KAYNAK_SECENEKLERI.map((secenek) => {
            const secili = kaynak === secenek.value;
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
                  name="kaynak"
                  value={secenek.value}
                  checked={secili}
                  onChange={(e) => {
                    setKaynak(e.target.value);
                    setDokunuldu(true);
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    secili ? "border-navy" : "border-line",
                  ].join(" ")}
                >
                  {secili && <span className="h-2 w-2 rounded-full bg-navy" />}
                </span>
                {secenek.label}
              </label>
            );
          })}
        </div>

        {digerSecili && (
          <input
            type="text"
            autoFocus
            placeholder="Nereden duyduğunuzu kısaca yazın"
            value={digerMetin}
            onChange={(e) => setDigerMetin(e.target.value)}
            onBlur={() => setDokunuldu(true)}
            className={[
              "mt-2.5 w-full rounded-[6px] border bg-paper px-3.5 py-2.5 text-[15px] text-charcoal",
              "placeholder:text-slate/50 transition-colors duration-150 ease-out",
              "focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10",
              "border-line",
            ].join(" ")}
          />
        )}

        {dokunuldu && hata && (
          <p className="mt-1.5 text-[13px] text-urgent">{hata}</p>
        )}
      </fieldset>

      <div className="mt-6">
        <button
          type="submit"
          disabled={!gecerli || gonderiliyor}
          className={
            gecerli && !gonderiliyor
              ? "cta w-full justify-center"
              : "flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[6px] bg-line px-[1.9rem] py-[0.95rem] text-[1.0625rem] font-semibold leading-none text-slate"
          }
        >
          {gonderiliyor ? "Gönderiliyor…" : "Gönder"}
          {!gonderiliyor && (
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
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>

        {gonderimHatasi && (
          <p className="mt-3 text-[13px] text-urgent">{gonderimHatasi}</p>
        )}

        <p className="mt-3 text-[13px] text-slate">
          {gonderiliyor
            ? "Dosyalarınız yükleniyor, lütfen sayfadan ayrılmayın."
            : "Bilgileriniz yalnızca bu başvuru için kullanılır."}
        </p>
      </div>
    </form>
  );
}
