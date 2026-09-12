"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useKazaBildir } from "@/contexts/KazaBildirContext";

const ALAN_SAYISI = 5;
const MAX_BOYUT = 10 * 1024 * 1024; // 10 MB

function boyutMetni(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function gecerliTip(file: File) {
  return file.type === "application/pdf" || file.type.startsWith("image/");
}

type Secim = { file: File; url: string | null; pdf: boolean };

function BelgeAlani({
  index,
  secim,
  hata,
  onSelect,
  onClear,
}: {
  index: number;
  secim: Secim | null;
  hata: string | undefined;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputId = `belge-${index}`;
  const baslik = `Belge ${index + 1}`;

  return (
    <div>
      <div className="text-[13px] font-medium text-charcoal">{baslik}</div>

      {secim ? (
        <div className="mt-2 flex items-center gap-3 rounded-[6px] border border-line bg-paper p-2.5">
          {secim.pdf || !secim.url ? (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-mist text-amber">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
            </span>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={secim.url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-[4px] object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] text-charcoal">
              {secim.file.name}
            </div>
            <div className="text-[12px] text-slate">
              {boyutMetni(secim.file.size)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[13px] text-slate underline decoration-line underline-offset-2 transition-colors duration-150 ease-out hover:text-navy"
          >
            Kaldır
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={[
            "mt-2 flex cursor-pointer items-center gap-3 rounded-[6px] border border-dashed px-4 py-3.5",
            "transition-colors duration-150 ease-out",
            hata ? "border-slate bg-paper" : "border-line bg-mist/50 hover:border-slate",
          ].join(" ")}
        >
          <svg
            className="h-5 w-5 shrink-0 text-amber"
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
          <span className="min-w-0">
            <span className="block text-[13px] font-medium text-navy">
              PDF veya fotoğraf seç
            </span>
            <span className="block text-[12px] text-slate">en fazla 10 MB</span>
          </span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="application/pdf,image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />

      {hata && <p className="mt-1.5 text-[13px] text-urgent">{hata}</p>}
    </div>
  );
}

export default function KazaRaporuForm() {
  const router = useRouter();
  const { adim3, setAdim3 } = useKazaBildir();

  // Geri dönülürse önceden seçilmiş belgeler (context'ten) yeniden önizlenir.
  const [secimler, setSecimler] = useState<(Secim | null)[]>(() =>
    Array.from({ length: ALAN_SAYISI }, (_, i) => {
      const file = adim3[i];
      if (!file) return null;
      const pdf = file.type === "application/pdf";
      return { file, pdf, url: pdf ? null : URL.createObjectURL(file) };
    }),
  );

  // Bileşen kaldırılınca oluşturulan object URL'leri serbest bırak.
  useEffect(() => {
    return () => {
      secimler.forEach((s) => s?.url && URL.revokeObjectURL(s.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hatalar = useMemo(() => {
    const e: Record<number, string> = {};
    secimler.forEach((s, i) => {
      if (!s) return;
      if (!gecerliTip(s.file)) {
        e[i] = "Yalnızca PDF veya görsel yükleyebilirsiniz.";
      } else if (s.file.size > MAX_BOYUT) {
        e[i] = "Dosya 10 MB sınırını aşıyor.";
      }
    });
    return e;
  }, [secimler]);

  const secilenSayisi = secimler.filter(Boolean).length;
  const gecerli = secilenSayisi >= 1 && Object.keys(hatalar).length === 0;

  const handleSelect = useCallback((index: number, file: File) => {
    setSecimler((prev) => {
      const next = [...prev];
      if (next[index]?.url) URL.revokeObjectURL(next[index]!.url!);
      const pdf = file.type === "application/pdf";
      next[index] = {
        file,
        pdf,
        url: pdf ? null : URL.createObjectURL(file),
      };
      return next;
    });
  }, []);

  const handleClear = useCallback((index: number) => {
    setSecimler((prev) => {
      const next = [...prev];
      if (next[index]?.url) URL.revokeObjectURL(next[index]!.url!);
      next[index] = null;
      return next;
    });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gecerli) return;

    const dosyalar = secimler.filter((s): s is Secim => Boolean(s)).map((s) => s.file);
    const meta = dosyalar.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    console.log("Kaza Bildir — Adım 3 (kaza raporu):", meta);

    setAdim3(dosyalar);
    router.push("/kaza-bildir/yeni/olay-yeri-fotograflari");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
      {secimler.map((secim, i) => (
        <BelgeAlani
          key={i}
          index={i}
          secim={secim}
          hata={hatalar[i]}
          onSelect={(file) => handleSelect(i, file)}
          onClear={() => handleClear(i)}
        />
      ))}

      <div className="pt-1">
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
          {secilenSayisi === 0
            ? "En az bir belge yüklemeniz yeterli."
            : `${secilenSayisi} belge eklendi. Dilerseniz daha fazlasını ekleyebilirsiniz.`}
        </p>
      </div>
    </form>
  );
}
