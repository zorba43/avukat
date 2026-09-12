"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { useKazaBildir } from "@/contexts/KazaBildirContext";
import { basvuruKlasoru } from "@/lib/basvuru";

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
  const [basvuruNo, setBasvuruNo] = useState<string | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  // Sayfa doğrudan açıldıysa ya da yenilendiyse (context sıfırlanır) önceki
  // adımlar eksik demektir — akışı baştan başlat.
  useEffect(() => {
    if (!adim1 || !adim2 || adim3.length === 0 || adim4.length < 3) {
      router.replace("/kaza-bildir/yeni");
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
      // id — veritabanı birincil anahtarı ve /basvuru/[id] linkinin tahmin
      // edilemez parçası. Tam UUID olarak kalır, hiçbir yerde kısaltılmaz.
      const id = crypto.randomUUID();

      // Blob'daki klasör adı okunabilir olsun diye isim + tarih + id'nin ilk 6
      // karakterinden oluşur (örn. ahmet-yilmaz-2026-09-11-a3f9c1). Aynı formül
      // (bkz. lib/basvuru.ts) ek belge yüklerken sunucu tarafında da kullanılır
      // ki dosyalar aynı klasöre düşsün.
      const klasorOneki = basvuruKlasoru({ ad: adim1!.ad, createdAt: new Date(), id });

      // Karşı taraf belgeleri opsiyonel — seçilmediyse hiç yüklenmez (undefined kalır).
      const karsiTarafYukle = (file: File | undefined, altKlasor: string) =>
        file
          ? blobaYukle(file, `${klasorOneki}/karsi-taraf/${altKlasor}/${file.name}`)
          : Promise.resolve(undefined);

      const [
        ruhsatUrl,
        ehliyetOnUrl,
        ehliyetArkaUrl,
        kazaRaporuUrls,
        fotograflarUrls,
        karsiTarafRuhsatUrl,
        karsiTarafEhliyetOnUrl,
        karsiTarafEhliyetArkaUrl,
      ] = await Promise.all([
        blobaYukle(adim2!.ruhsat, `${klasorOneki}/ruhsat/${adim2!.ruhsat.name}`),
        blobaYukle(
          adim2!.ehliyetOn,
          `${klasorOneki}/ehliyet-on/${adim2!.ehliyetOn.name}`,
        ),
        blobaYukle(
          adim2!.ehliyetArka,
          `${klasorOneki}/ehliyet-arka/${adim2!.ehliyetArka.name}`,
        ),
        Promise.all(
          adim3.map((f, i) =>
            blobaYukle(f, `${klasorOneki}/kaza-raporu/${i}-${f.name}`),
          ),
        ),
        Promise.all(
          adim4.map((f, i) =>
            blobaYukle(f, `${klasorOneki}/fotograflar/${i}-${f.name}`),
          ),
        ),
        karsiTarafYukle(adim2!.karsiTarafRuhsat, "ruhsat"),
        karsiTarafYukle(adim2!.karsiTarafEhliyetOn, "ehliyet-on"),
        karsiTarafYukle(adim2!.karsiTarafEhliyetArka, "ehliyet-arka"),
      ]);

      const res = await fetch("/api/kaza-bildirimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ad: adim1!.ad,
          telefon: adim1!.telefon,
          tarih: adim1!.tarih,
          basvuruNiteligi: adim1!.basvuruNiteligi,
          kazaDurumu: adim1!.kazaDurumu,
          ruhsatUrl,
          ehliyetOnUrl,
          ehliyetArkaUrl,
          karsiTarafRuhsatUrl,
          karsiTarafEhliyetOnUrl,
          karsiTarafEhliyetArkaUrl,
          kazaRaporuUrls,
          fotograflarUrls,
          kaynak: adim5Verisi.kaynak,
          kaynakDetay: adim5Verisi.kaynakDetay,
        }),
      });

      const govde = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(govde.error || "Gönderim başarısız oldu.");
      }

      setBasvuruNo(govde.basvuruNo ?? null);
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

        {basvuruNo && (
          <>
            <div className="mt-2 w-full rounded-card border border-line bg-mist p-5">
              <p className="text-[13px] text-slate">Başvuru Numaranız</p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3">
                <span className="font-serif text-2xl font-medium tracking-wide text-navy">
                  {basvuruNo}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(basvuruNo);
                      setKopyalandi(true);
                      setTimeout(() => setKopyalandi(false), 2000);
                    } catch {
                      // Pano API'si kullanılamıyorsa sessizce yoksay.
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-[6px] border border-line bg-paper px-3 py-1.5 text-[13px] font-medium text-navy transition-colors duration-150 ease-out hover:border-slate"
                >
                  {kopyalandi ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="12" height="12" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                  )}
                  {kopyalandi ? "Kopyalandı" : "Kopyala"}
                </button>
              </div>
            </div>

            <div className="w-full rounded-card bg-navy-deep p-4">
              <p className="text-[13px] font-bold uppercase tracking-wide text-white">
                Lütfen başvuru numaranızı kaydediniz
              </p>
              <p className="mt-1 text-[13px] text-white/70">
                Ek belge yüklemek istediğinizde bu numarayı kullanacaksınız.
              </p>
            </div>
          </>
        )}

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
