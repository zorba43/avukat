"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useKazaBildir } from "@/contexts/KazaBildirContext";

const MIN_FOTO = 3;
const MAX_FOTO = 20;
const MAX_BOYUT = 10 * 1024 * 1024; // 10 MB

type Foto = { file: File; url: string };

function gecerliGorsel(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_BOYUT;
}

export default function OlayYeriFotograflarForm() {
  const router = useRouter();
  const { adim4, setAdim4 } = useKazaBildir();

  // Geri dönülürse önceden seçilmiş fotoğraflar (context'ten) yeniden önizlenir.
  const [fotolar, setFotolar] = useState<Foto[]>(() =>
    adim4.map((file) => ({ file, url: URL.createObjectURL(file) })),
  );
  const [uyari, setUyari] = useState<string | null>(null);
  const [dokunuldu, setDokunuldu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      fotolar.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eksik = MIN_FOTO - fotolar.length;
  const gecerli = fotolar.length >= MIN_FOTO;
  const doluMu = fotolar.length >= MAX_FOTO;

  function handleFiles(fileList: FileList) {
    setDokunuldu(true);
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
    setDokunuldu(true);
    setFotolar((prev) => {
      const hedef = prev[index];
      if (hedef) URL.revokeObjectURL(hedef.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDokunuldu(true);
    if (!gecerli) return;

    const dosyalar = fotolar.map((f) => f.file);
    const meta = dosyalar.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    console.log("Kaza Bildir — Adım 4 (olay yeri fotoğrafları):", meta);

    setAdim4(dosyalar);
    router.push("/kaza-bildir/yeni/tamamla");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-slate">
          {fotolar.length} / {MAX_FOTO} fotoğraf
        </span>
        <span className="text-[13px] text-slate">En az {MIN_FOTO} fotoğraf</span>
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

      {dokunuldu && !gecerli && (
        <p className="mt-2 text-[13px] text-urgent">
          En az {MIN_FOTO} fotoğraf gerekli — {eksik} tane daha ekleyin.
        </p>
      )}

      <div className="mt-6">
        <button
          type="submit"
          disabled={!gecerli}
          className={
            gecerli
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
          Fotoğraflarınız yalnızca bu başvuru için kullanılır.
        </p>
      </div>
    </form>
  );
}
