"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import { basvuruKlasoru } from "@/lib/basvuru";

type Ozet = {
  id: string;
  createdAt: string;
  ad: string;
  telefonMaskeli: string;
  kazaTarihi: string;
  basvuruNiteligi: string;
  kazaRaporuSayisi: number;
  fotografSayisi: number;
};

type Tip = "kazaRaporu" | "fotograf";
type Gorunum = "dogrulama" | "ozet" | "yukle" | "basarili";

const BASVURU_NITELIGI_ETIKETI: Record<string, string> = {
  "arac-sahibi-kullanmadi": "Araç Sahibiyim ama aracı ben kullanmadım",
  "arac-soforu": "Araç Şoförü",
  "hem-sahibi-hem-soforu": "Hem araç sahibi hem araç şoförü",
  yolcu: "Yolcu",
};

const MAX_KAZA_RAPORU = 5;
const MAX_FOTOGRAF = 20;
const MAX_BOYUT = 10 * 1024 * 1024; // 10 MB

function formatTarih(tarih: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(tarih));
}

const inputClass =
  "mt-1.5 w-full rounded-[6px] border border-line bg-paper px-3.5 py-2.5 text-[15px] text-charcoal " +
  "placeholder:text-slate/50 transition-colors duration-150 ease-out " +
  "focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10";

export default function EkBelgeForm() {
  const [gorunum, setGorunum] = useState<Gorunum>("dogrulama");

  const [basvuruNo, setBasvuruNo] = useState("");
  const [telefonSon4, setTelefonSon4] = useState("");
  const [dogrulaniyor, setDogrulaniyor] = useState(false);
  const [dogrulamaHatasi, setDogrulamaHatasi] = useState<string | null>(null);
  const [ozet, setOzet] = useState<Ozet | null>(null);

  const [secilenTip, setSecilenTip] = useState<Tip | null>(null);
  const [dosyalar, setDosyalar] = useState<{ file: File; url: string }[]>([]);
  const [uyari, setUyari] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderimHatasi, setGonderimHatasi] = useState<string | null>(null);
  const [sonuc, setSonuc] = useState<{ kazaRaporuSayisi: number; fotografSayisi: number } | null>(null);

  async function handleDogrulama(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDogrulamaHatasi(null);
    setDogrulaniyor(true);
    try {
      const res = await fetch("/api/basvuru-bul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basvuruNo, telefonSon4 }),
      });
      const govde = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(govde.error || "Başvuru numarası veya telefon bilgisi hatalı.");
      }
      setOzet(govde);
      setGorunum("ozet");
    } catch (err) {
      setDogrulamaHatasi(
        err instanceof Error ? err.message : "Başvuru numarası veya telefon bilgisi hatalı.",
      );
    } finally {
      setDogrulaniyor(false);
    }
  }

  function baslaYukleme(tip: Tip) {
    setSecilenTip(tip);
    setDosyalar([]);
    setUyari(null);
    setGonderimHatasi(null);
    setGorunum("yukle");
  }

  const kabulEdilenTip = secilenTip === "kazaRaporu" ? "application/pdf,image/*" : "image/*";
  const kalanKapasite = useMemo(() => {
    if (!ozet || !secilenTip) return 0;
    const maks = secilenTip === "kazaRaporu" ? MAX_KAZA_RAPORU : MAX_FOTOGRAF;
    const mevcut = secilenTip === "kazaRaporu" ? ozet.kazaRaporuSayisi : ozet.fotografSayisi;
    return Math.max(maks - mevcut - dosyalar.length, 0);
  }, [ozet, secilenTip, dosyalar.length]);

  function gecerliDosya(file: File) {
    const tipUygun =
      secilenTip === "kazaRaporu"
        ? file.type === "application/pdf" || file.type.startsWith("image/")
        : file.type.startsWith("image/");
    return tipUygun && file.size <= MAX_BOYUT;
  }

  function handleFiles(fileList: FileList) {
    const gelenler = Array.from(fileList);
    const gecerliOlanlar = gelenler.filter(gecerliDosya);
    const reddedilen = gelenler.length - gecerliOlanlar.length;

    const eklenecekler = gecerliOlanlar.slice(0, kalanKapasite);
    const kapasiteAsimi = gecerliOlanlar.length - eklenecekler.length;

    if (eklenecekler.length > 0) {
      setDosyalar((prev) => [
        ...prev,
        ...eklenecekler.map((file) => ({ file, url: URL.createObjectURL(file) })),
      ]);
    }

    if (reddedilen > 0 && kapasiteAsimi > 0) {
      setUyari(`${reddedilen} dosya desteklenmiyor, ${kapasiteAsimi} dosya ise sınır nedeniyle eklenmedi.`);
    } else if (reddedilen > 0) {
      setUyari(`${reddedilen} dosya desteklenmiyor veya 10 MB sınırını aşıyor, eklenmedi.`);
    } else if (kapasiteAsimi > 0) {
      setUyari(`Kalan kapasite nedeniyle ${kapasiteAsimi} dosya eklenmedi.`);
    } else {
      setUyari(null);
    }
  }

  function handleRemove(index: number) {
    setDosyalar((prev) => {
      const hedef = prev[index];
      if (hedef) URL.revokeObjectURL(hedef.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleEkleGonder() {
    if (!ozet || !secilenTip || dosyalar.length === 0) return;
    setGonderiliyor(true);
    setGonderimHatasi(null);

    try {
      const klasorOneki = basvuruKlasoru({
        ad: ozet.ad,
        createdAt: new Date(ozet.createdAt),
        id: ozet.id,
      });
      const altKlasor = secilenTip === "kazaRaporu" ? "kaza-raporu-ek" : "fotograflar-ek";

      const urls = await Promise.all(
        dosyalar.map(({ file }, i) =>
          upload(`${klasorOneki}/${altKlasor}/${i}-${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/blob-upload",
          }).then((blob) => blob.url),
        ),
      );

      const res = await fetch("/api/ek-belge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basvuruNo, telefonSon4, tip: secilenTip, urls }),
      });
      const govde = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(govde.error || "Yükleme başarısız oldu.");
      }

      setSonuc({ kazaRaporuSayisi: govde.kazaRaporuSayisi, fotografSayisi: govde.fotografSayisi });
      setGorunum("basarili");
    } catch (err) {
      setGonderimHatasi(
        err instanceof Error ? err.message : "Yükleme başarısız oldu, lütfen tekrar deneyin.",
      );
    } finally {
      setGonderiliyor(false);
    }
  }

  // ============================ DOĞRULAMA ============================
  if (gorunum === "dogrulama") {
    return (
      <form onSubmit={handleDogrulama} noValidate className="mt-7 space-y-6">
        <div>
          <label htmlFor="basvuruNo" className="block text-[13px] text-slate">
            Başvuru Numarası
          </label>
          <input
            id="basvuruNo"
            type="text"
            required
            placeholder="GH-2026-4821"
            value={basvuruNo}
            onChange={(e) => setBasvuruNo(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="telefonSon4" className="block text-[13px] text-slate">
            Telefon Numaranızın Son 4 Hanesi
          </label>
          <input
            id="telefonSon4"
            type="text"
            inputMode="numeric"
            maxLength={4}
            required
            placeholder="5573"
            value={telefonSon4}
            onChange={(e) => setTelefonSon4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={inputClass}
          />
        </div>

        {dogrulamaHatasi && (
          <p className="text-[13px] text-urgent">{dogrulamaHatasi}</p>
        )}

        <button
          type="submit"
          disabled={!basvuruNo || telefonSon4.length !== 4 || dogrulaniyor}
          className={
            basvuruNo && telefonSon4.length === 4 && !dogrulaniyor
              ? "cta w-full justify-center"
              : "flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[6px] bg-line px-[1.9rem] py-[0.95rem] text-[1.0625rem] font-semibold leading-none text-slate"
          }
        >
          {dogrulaniyor ? "Aranıyor…" : "Başvurumu Bul"}
        </button>
      </form>
    );
  }

  // ============================== ÖZET ================================
  if (gorunum === "ozet" && ozet) {
    const raporDoluMu = ozet.kazaRaporuSayisi >= MAX_KAZA_RAPORU;
    const fotoDoluMu = ozet.fotografSayisi >= MAX_FOTOGRAF;

    return (
      <div className="mt-7">
        <dl className="grid gap-4 rounded-[6px] border border-line bg-mist/50 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-[13px] text-slate">İsim Soyisim</dt>
            <dd className="mt-0.5 text-[15px] text-charcoal">{ozet.ad}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-slate">Telefon</dt>
            <dd className="mt-0.5 text-[15px] text-charcoal">{ozet.telefonMaskeli}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-slate">Kaza Tarihi</dt>
            <dd className="mt-0.5 text-[15px] text-charcoal">{formatTarih(ozet.kazaTarihi)}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-slate">Başvuranın Niteliği</dt>
            <dd className="mt-0.5 text-[15px] text-charcoal">
              {BASVURU_NITELIGI_ETIKETI[ozet.basvuruNiteligi] ?? ozet.basvuruNiteligi}
            </dd>
          </div>
        </dl>

        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between rounded-[6px] border border-line px-4 py-3 text-[14px]">
            <span className="text-charcoal">Kaza Raporu</span>
            <span className={raporDoluMu ? "text-slate" : "font-medium text-navy"}>
              {ozet.kazaRaporuSayisi > 0 ? `Yüklendi ✓ (${ozet.kazaRaporuSayisi} dosya)` : "Yüklenmedi"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-[6px] border border-line px-4 py-3 text-[14px]">
            <span className="text-charcoal">Fotoğraflar</span>
            <span className="font-medium text-navy">
              {ozet.fotografSayisi} / {MAX_FOTOGRAF} yüklendi
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={raporDoluMu}
            onClick={() => baslaYukleme("kazaRaporu")}
            className={
              raporDoluMu
                ? "flex w-full cursor-not-allowed items-center justify-center rounded-[6px] bg-line px-6 py-3 text-[15px] font-semibold text-slate"
                : "flex w-full items-center justify-center rounded-[6px] border border-navy px-6 py-3 text-[15px] font-semibold text-navy transition-colors duration-150 ease-out hover:bg-navy/[0.04]"
            }
          >
            Kaza Raporu Ekle
          </button>
          {raporDoluMu && (
            <p className="text-center text-[13px] text-slate">Maksimum sayıya ulaşıldı.</p>
          )}

          <button
            type="button"
            disabled={fotoDoluMu}
            onClick={() => baslaYukleme("fotograf")}
            className={
              fotoDoluMu
                ? "flex w-full cursor-not-allowed items-center justify-center rounded-[6px] bg-line px-6 py-3 text-[15px] font-semibold text-slate"
                : "flex w-full items-center justify-center rounded-[6px] border border-navy px-6 py-3 text-[15px] font-semibold text-navy transition-colors duration-150 ease-out hover:bg-navy/[0.04]"
            }
          >
            Fotoğraf Ekle
          </button>
          {fotoDoluMu && (
            <p className="text-center text-[13px] text-slate">Maksimum sayıya ulaşıldı.</p>
          )}
        </div>
      </div>
    );
  }

  // ============================== YÜKLE ================================
  if (gorunum === "yukle" && secilenTip) {
    const baslik = secilenTip === "kazaRaporu" ? "Kaza Raporu Ekle" : "Fotoğraf Ekle";
    const doluMu = kalanKapasite === 0 && dosyalar.length === 0;

    return (
      <div className="mt-7">
        <h2 className="font-serif text-lg font-medium text-navy">{baslik}</h2>

        {dosyalar.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {dosyalar.map((d, i) => (
              <div
                key={d.url}
                className="relative aspect-square overflow-hidden rounded-[6px] border border-line bg-mist"
              >
                {d.file.type === "application/pdf" ? (
                  <span className="flex h-full w-full items-center justify-center text-amber">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <path d="M14 3v5h5" />
                    </svg>
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.url} alt="" className="h-full w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  aria-label="Dosyayı kaldır"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-deep/70 text-white transition-colors duration-150 ease-out hover:bg-navy-deep"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {!doluMu && kalanKapasite > 0 && (
          <label
            htmlFor="ek-belge-dosyalar"
            className={[
              "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[6px]",
              "border border-dashed border-line bg-mist/50 px-4 py-6 text-center transition-colors duration-150 ease-out hover:border-slate",
              dosyalar.length > 0 ? "mt-3" : "mt-2",
            ].join(" ")}
          >
            <svg className="h-6 w-6 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5" />
              <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
            </svg>
            <span className="text-[13px] font-medium text-navy">
              {secilenTip === "kazaRaporu" ? "PDF veya fotoğraf seç" : "Fotoğraf seç"}
            </span>
            <span className="text-[12px] text-slate">en fazla 10 MB · birden fazla seçebilirsiniz</span>
          </label>
        )}

        <input
          id="ek-belge-dosyalar"
          type="file"
          accept={kabulEdilenTip}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {uyari && <p className="mt-2 text-[13px] text-urgent">{uyari}</p>}
        {gonderimHatasi && <p className="mt-2 text-[13px] text-urgent">{gonderimHatasi}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            disabled={dosyalar.length === 0 || gonderiliyor}
            onClick={handleEkleGonder}
            className={
              dosyalar.length > 0 && !gonderiliyor
                ? "cta flex-1 justify-center"
                : "flex flex-1 cursor-not-allowed items-center justify-center rounded-[6px] bg-line px-6 py-3 text-[15px] font-semibold text-slate"
            }
          >
            {gonderiliyor ? "Yükleniyor…" : "Gönder"}
          </button>
          <button
            type="button"
            onClick={() => setGorunum("ozet")}
            className="flex-1 rounded-[6px] border border-line px-6 py-3 text-[15px] font-medium text-slate transition-colors duration-150 ease-out hover:border-slate hover:text-navy"
          >
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  // ============================= BAŞARILI ==============================
  if (gorunum === "basarili" && sonuc && ozet) {
    return (
      <div className="mt-7 flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="font-serif text-xl font-medium text-navy">Belgeniz eklendi</h2>
        <p className="max-w-[36ch] text-sm text-slate">
          Kaza Raporu: {sonuc.kazaRaporuSayisi} dosya · Fotoğraflar: {sonuc.fotografSayisi} /{" "}
          {MAX_FOTOGRAF}
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setOzet((o) =>
                o
                  ? {
                      ...o,
                      kazaRaporuSayisi: sonuc.kazaRaporuSayisi,
                      fotografSayisi: sonuc.fotografSayisi,
                    }
                  : o,
              );
              setGorunum("ozet");
            }}
            className="text-sm font-medium text-navy underline decoration-line underline-offset-4 transition-colors duration-150 ease-out hover:decoration-navy"
          >
            Başka belge ekle
          </button>
          <Link
            href="/"
            className="text-sm font-medium text-navy underline decoration-line underline-offset-4 transition-colors duration-150 ease-out hover:decoration-navy"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
