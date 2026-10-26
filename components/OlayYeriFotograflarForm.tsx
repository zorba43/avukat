"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useKazaBildir, type EkBelgeler } from "@/contexts/KazaBildirContext";

const MAX_FOTO = 20;
const MAX_EK_BELGE = 5; // Her ek belge kategorisi için ayrı ayrı
const MAX_BOYUT = 10 * 1024 * 1024; // 10 MB

type Foto = { file: File; url: string };

function gecerliGorsel(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_BOYUT;
}

function gecerliBelge(file: File) {
  return (
    (file.type === "application/pdf" || file.type.startsWith("image/")) &&
    file.size <= MAX_BOYUT
  );
}

function boyutMetni(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EK_BELGE_ALANLARI: { key: keyof EkBelgeler; baslik: string; aciklama: string }[] = [
  {
    key: "ifade",
    baslik: "İfade verdim — İfade Örneği",
    aciklama: "Kaza sonrası ifade verdiyseniz ifade tutanağının fotoğrafı veya PDF'i.",
  },
  {
    key: "saglikRaporu",
    baslik: "Sağlık Raporu",
    aciklama: "Hastane/doktor raporu, epikriz vb. belgeler.",
  },
  {
    key: "digerEvrak",
    baslik: "Diğer Evraklar",
    aciklama: "Başvurunuzla ilgili olduğunu düşündüğünüz diğer belgeler.",
  },
];

/**
 * Opsiyonel ek belge kategorisi — kapalı başlar, kullanıcı işaretleyince
 * yükleme alanı açılır. İşaret kaldırılırsa seçilen dosyalar da temizlenir.
 */
function EkBelgeAlani({
  alanKey,
  baslik,
  aciklama,
  dosyalar,
  onChange,
}: {
  alanKey: string;
  baslik: string;
  aciklama: string;
  dosyalar: File[];
  onChange: (dosyalar: File[]) => void;
}) {
  const [acik, setAcik] = useState(dosyalar.length > 0);
  const [uyari, setUyari] = useState<string | null>(null);
  const inputId = `ek-belge-${alanKey}`;
  const doluMu = dosyalar.length >= MAX_EK_BELGE;

  function handleFiles(fileList: FileList) {
    const gelenler = Array.from(fileList);
    const gecerliOlanlar = gelenler.filter(gecerliBelge);
    const kalan = Math.max(MAX_EK_BELGE - dosyalar.length, 0);
    const eklenecekler = gecerliOlanlar.slice(0, kalan);
    const reddedilen = gelenler.length - gecerliOlanlar.length;
    const kapasiteAsimi = gecerliOlanlar.length - eklenecekler.length;

    if (eklenecekler.length > 0) onChange([...dosyalar, ...eklenecekler]);

    if (reddedilen > 0) {
      setUyari(`${reddedilen} dosya desteklenmiyor veya 10 MB sınırını aşıyor, eklenmedi.`);
    } else if (kapasiteAsimi > 0) {
      setUyari(`En fazla ${MAX_EK_BELGE} dosya eklenebilir, ${kapasiteAsimi} dosya eklenmedi.`);
    } else {
      setUyari(null);
    }
  }

  return (
    <div
      className={[
        "rounded-[6px] border transition-colors duration-150 ease-out",
        acik ? "border-navy bg-navy/[0.02]" : "border-line",
      ].join(" ")}
    >
      <label className="flex cursor-pointer items-start gap-3 px-4 py-3 focus-within:ring-2 focus-within:ring-navy/10">
        <input
          type="checkbox"
          checked={acik}
          onChange={(e) => {
            setAcik(e.target.checked);
            if (!e.target.checked) {
              onChange([]);
              setUyari(null);
            }
          }}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={[
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
            acik ? "border-navy bg-navy text-white" : "border-line",
          ].join(" ")}
        >
          {acik && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={["block text-[15px]", acik ? "font-medium text-navy" : "text-charcoal"].join(" ")}>
            {baslik}
            <span className="ml-1.5 text-[12px] font-normal text-slate">(opsiyonel)</span>
          </span>
          <span className="mt-0.5 block text-[12px] text-slate">{aciklama}</span>
        </span>
      </label>

      {acik && (
        <div className="px-4 pb-4">
          {dosyalar.length > 0 && (
            <ul className="space-y-2">
              {dosyalar.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 rounded-[6px] border border-line bg-paper px-3 py-2"
                >
                  <svg className="h-5 w-5 shrink-0 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] text-charcoal">{file.name}</div>
                    <div className="text-[12px] text-slate">{boyutMetni(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange(dosyalar.filter((_, j) => j !== i))}
                    className="shrink-0 text-[13px] text-slate underline decoration-line underline-offset-2 transition-colors duration-150 ease-out hover:text-navy"
                  >
                    Kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!doluMu && (
            <label
              htmlFor={inputId}
              className={[
                "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[6px]",
                "border border-dashed border-line bg-mist/50 px-4 py-4 text-center",
                "transition-colors duration-150 ease-out hover:border-slate",
                dosyalar.length > 0 ? "mt-2" : "",
              ].join(" ")}
            >
              <span className="text-[13px] font-medium text-navy">
                {dosyalar.length > 0 ? "Dosya ekle" : "Dosya seç"}
              </span>
              <span className="text-[12px] text-slate">
                PDF, JPG veya PNG · en fazla 10 MB · en fazla {MAX_EK_BELGE} dosya
              </span>
            </label>
          )}
          <input
            id={inputId}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {uyari && <p className="mt-2 text-[13px] text-urgent">{uyari}</p>}
        </div>
      )}
    </div>
  );
}

export default function OlayYeriFotograflarForm() {
  const router = useRouter();
  const { adim4, setAdim4, ekBelgeler, setEkBelgeler } = useKazaBildir();

  // Geri dönülürse önceden seçilmiş fotoğraflar (context'ten) yeniden önizlenir.
  const [fotolar, setFotolar] = useState<Foto[]>(() =>
    adim4.map((file) => ({ file, url: URL.createObjectURL(file) })),
  );
  const [uyari, setUyari] = useState<string | null>(null);
  const [ekler, setEkler] = useState<EkBelgeler>(ekBelgeler);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      fotolar.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doluMu = fotolar.length >= MAX_FOTO;

  function handleFiles(fileList: FileList) {
    const gelenler = Array.from(fileList);
    const gecerliOlanlar = gelenler.filter(gecerliGorsel);
    const reddedilen = gelenler.length - gecerliOlanlar.length;

    const kalanKapasite = Math.max(MAX_FOTO - fotolar.length, 0);
    const eklenecekler = gecerliOlanlar.slice(0, kalanKapasite);
    const kapasiteAsimi = gecerliOlanlar.length - eklenecekler.length;

    if (eklenecekler.length > 0) {
      setFotolar((prev) => [
        ...prev,
        ...eklenecekler.map((file) => ({ file, url: URL.createObjectURL(file) })),
      ]);
    }

    if (reddedilen > 0 && kapasiteAsimi > 0) {
      setUyari(
        `${reddedilen} dosya desteklenmiyor veya çok büyük, ${kapasiteAsimi} dosya ise ${MAX_FOTO} fotoğraf sınırı nedeniyle eklenmedi.`,
      );
    } else if (reddedilen > 0) {
      setUyari(
        `${reddedilen} dosya desteklenmiyor veya 10 MB sınırını aşıyor, eklenmedi.`,
      );
    } else if (kapasiteAsimi > 0) {
      setUyari(`En fazla ${MAX_FOTO} fotoğraf eklenebilir, ${kapasiteAsimi} dosya eklenmedi.`);
    } else {
      setUyari(null);
    }
  }

  function handleRemove(index: number) {
    setFotolar((prev) => {
      const hedef = prev[index];
      if (hedef) URL.revokeObjectURL(hedef.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dosyalar = fotolar.map((f) => f.file);
    const meta = dosyalar.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    console.log("Kaza Bildir — Adım 4 (olay yeri fotoğrafları):", meta);

    setAdim4(dosyalar);
    setEkBelgeler(ekler);
    router.push("/kaza-bildir/yeni/tamamla");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-slate">
          {fotolar.length} / {MAX_FOTO} fotoğraf
        </span>
        <span className="text-[13px] text-slate">Opsiyonel</span>
      </div>

      {fotolar.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotolar.map((foto, i) => (
            <div
              key={foto.url}
              className="relative aspect-square overflow-hidden rounded-[6px] border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label="Fotoğrafı kaldır"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-deep/70 text-white transition-colors duration-150 ease-out hover:bg-navy-deep"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {!doluMu && (
        <label
          htmlFor="olay-yeri-fotolar"
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[6px]",
            "border border-dashed px-4 py-6 text-center transition-colors duration-150 ease-out",
            fotolar.length > 0 ? "mt-3" : "mt-2",
            "border-line bg-mist/50 hover:border-slate",
          ].join(" ")}
        >
          <svg
            className="h-6 w-6 text-amber"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 16V4M7 9l5-5 5 5" />
            <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
          </svg>
          <span className="text-[13px] font-medium text-navy">
            {fotolar.length > 0 ? "Fotoğraf ekle" : "Fotoğraf seç"}
          </span>
          <span className="text-[12px] text-slate">
            JPG veya PNG · en fazla 10 MB · birden fazla seçebilirsiniz
          </span>
        </label>
      )}

      <input
        ref={inputRef}
        id="olay-yeri-fotolar"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {uyari && <p className="mt-2 text-[13px] text-urgent">{uyari}</p>}

      <div className="mt-8 border-t border-line pt-6">
        <h2 className="font-serif text-lg font-medium text-navy">Diğer belgeler</h2>
        <p className="mt-1 text-[13px] text-slate">
          Elinizde varsa ilgili kutuyu işaretleyip dosya ekleyin.
        </p>
        <div className="mt-4 space-y-2.5">
          {EK_BELGE_ALANLARI.map((alan) => (
            <EkBelgeAlani
              key={alan.key}
              alanKey={alan.key}
              baslik={alan.baslik}
              aciklama={alan.aciklama}
              dosyalar={ekler[alan.key]}
              onChange={(dosyalar) => setEkler((prev) => ({ ...prev, [alan.key]: dosyalar }))}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" className="cta w-full justify-center">
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
          Fotoğraflarınız ve belgeleriniz yalnızca bu başvuru için kullanılır.
        </p>
      </div>
    </form>
  );
}
