"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useKazaBildir } from "@/contexts/KazaBildirContext";

type AlanKey =
  | "ruhsat"
  | "ehliyetOn"
  | "ehliyetArka"
  | "karsiTarafRuhsat"
  | "karsiTarafEhliyetOn"
  | "karsiTarafEhliyetArka";

const ZORUNLU_ALANLAR: AlanKey[] = ["ruhsat", "ehliyetOn", "ehliyetArka"];

type AlanTanimi = { key: AlanKey; baslik: string; aciklama: string };

const SOL_ALANLAR: AlanTanimi[] = [
  {
    key: "ruhsat",
    baslik: "Araç Ruhsatınız",
    aciklama: "Ruhsatın bilgileri okunacak şekilde net bir fotoğrafı.",
  },
  {
    key: "ehliyetOn",
    baslik: "Ehliyetinizin Ön Yüzü",
    aciklama: "Sürücü belgenizin fotoğraflı ön yüzü.",
  },
  {
    key: "ehliyetArka",
    baslik: "Ehliyetinizin Arka Yüzü",
    aciklama: "Sürücü belgenizin arka yüzü.",
  },
];

const SAG_ALANLAR: AlanTanimi[] = [
  {
    key: "karsiTarafRuhsat",
    baslik: "Karşı Taraf Araç Ruhsatı",
    aciklama: "Elinizdeyse karşı tarafın ruhsat fotoğrafı.",
  },
  {
    key: "karsiTarafEhliyetOn",
    baslik: "Karşı Taraf Ehliyeti — Ön Yüz",
    aciklama: "Elinizdeyse karşı tarafın ehliyetinin ön yüzü.",
  },
  {
    key: "karsiTarafEhliyetArka",
    baslik: "Karşı Taraf Ehliyeti — Arka Yüz",
    aciklama: "Elinizdeyse karşı tarafın ehliyetinin arka yüzü.",
  },
];

const MAX_BOYUT = 10 * 1024 * 1024; // 10 MB

function boyutMetni(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Secim = { file: File; url: string };

function FotoAlani({
  baslik,
  aciklama,
  secim,
  hata,
  onSelect,
  onClear,
}: {
  baslik: string;
  aciklama: string;
  secim: Secim | null;
  hata: string | undefined;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputId = `foto-${baslik}`;

  return (
    <div>
      <div className="text-[13px] font-medium text-charcoal">{baslik}</div>
      <p className="mt-0.5 text-[13px] text-slate">{aciklama}</p>

      {secim ? (
        <div className="mt-2 flex items-center gap-3 rounded-[6px] border border-line bg-paper p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={secim.url}
            alt=""
            className="h-14 w-14 shrink-0 rounded-[4px] object-cover"
          />
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
            "mt-2 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[6px]",
            "border border-dashed px-4 py-6 text-center transition-colors duration-150 ease-out",
            hata
              ? "border-slate bg-paper"
              : "border-line bg-mist/50 hover:border-slate",
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
          <span className="text-[13px] font-medium text-navy">Fotoğraf seç</span>
          <span className="text-[12px] text-slate">JPG veya PNG · en fazla 10 MB</span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
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

export default function RuhsatEhliyetForm() {
  const router = useRouter();
  const { adim2, setAdim2 } = useKazaBildir();

  // Geri dönülürse önceden seçilmiş dosyalar (context'ten) yeniden önizlenir.
  const [secimler, setSecimler] = useState<Record<AlanKey, Secim | null>>(() => {
    const dosyaUrl = (file: File | undefined) =>
      file ? { file, url: URL.createObjectURL(file) } : null;
    return {
      ruhsat: adim2 ? { file: adim2.ruhsat, url: URL.createObjectURL(adim2.ruhsat) } : null,
      ehliyetOn: adim2
        ? { file: adim2.ehliyetOn, url: URL.createObjectURL(adim2.ehliyetOn) }
        : null,
      ehliyetArka: adim2
        ? { file: adim2.ehliyetArka, url: URL.createObjectURL(adim2.ehliyetArka) }
        : null,
      karsiTarafRuhsat: dosyaUrl(adim2?.karsiTarafRuhsat),
      karsiTarafEhliyetOn: dosyaUrl(adim2?.karsiTarafEhliyetOn),
      karsiTarafEhliyetArka: dosyaUrl(adim2?.karsiTarafEhliyetArka),
    };
  });
  const [dokunulan, setDokunulan] = useState<Record<AlanKey, boolean>>({
    ruhsat: false,
    ehliyetOn: false,
    ehliyetArka: false,
    karsiTarafRuhsat: false,
    karsiTarafEhliyetOn: false,
    karsiTarafEhliyetArka: false,
  });

  // Bileşen kaldırılınca oluşturulan object URL'leri serbest bırak.
  useEffect(() => {
    return () => {
      Object.values(secimler).forEach((s) => s && URL.revokeObjectURL(s.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hatalar = useMemo(() => {
    const e: Partial<Record<AlanKey, string>> = {};
    (Object.keys(secimler) as AlanKey[]).forEach((key) => {
      const s = secimler[key];
      if (!s) {
        // Karşı taraf alanları opsiyonel — boş bırakılması hata sayılmaz.
        if (ZORUNLU_ALANLAR.includes(key)) {
          e[key] = "Bu fotoğraf gerekli.";
        }
        return;
      }
      if (!s.file.type.startsWith("image/")) {
        e[key] = "Lütfen bir görsel dosyası yükleyin.";
      } else if (s.file.size > MAX_BOYUT) {
        e[key] = "Dosya 10 MB sınırını aşıyor.";
      }
    });
    return e;
  }, [secimler]);

  const gecerli = Object.keys(hatalar).length === 0;

  const handleSelect = useCallback((key: AlanKey, file: File) => {
    setDokunulan((d) => ({ ...d, [key]: true }));
    setSecimler((prev) => {
      const onceki = prev[key];
      if (onceki) URL.revokeObjectURL(onceki.url);
      return { ...prev, [key]: { file, url: URL.createObjectURL(file) } };
    });
  }, []);

  const handleClear = useCallback((key: AlanKey) => {
    setDokunulan((d) => ({ ...d, [key]: true }));
    setSecimler((prev) => {
      const onceki = prev[key];
      if (onceki) URL.revokeObjectURL(onceki.url);
      return { ...prev, [key]: null };
    });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gecerli) return;

    const meta = Object.fromEntries(
      (Object.keys(secimler) as AlanKey[])
        .filter((key) => secimler[key])
        .map((key) => {
          const s = secimler[key]!;
          return [key, { name: s.file.name, size: s.file.size, type: s.file.type }];
        }),
    );
    console.log("Kaza Bildir — Adım 2 (ruhsat & ehliyet):", meta);

    setAdim2({
      ruhsat: secimler.ruhsat!.file,
      ehliyetOn: secimler.ehliyetOn!.file,
      ehliyetArka: secimler.ehliyetArka!.file,
      karsiTarafRuhsat: secimler.karsiTarafRuhsat?.file,
      karsiTarafEhliyetOn: secimler.karsiTarafEhliyetOn?.file,
      karsiTarafEhliyetArka: secimler.karsiTarafEhliyetArka?.file,
    });
    router.push("/kaza-bildir/yeni/kaza-raporu");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
        {/* ========================= SİZİN BELGELERİNİZ ========================= */}
        <div className="space-y-6">
          <h2 className="text-[15px] font-semibold text-navy">
            Sizin Belgeleriniz
          </h2>
          {SOL_ALANLAR.map((alan) => (
            <FotoAlani
              key={alan.key}
              baslik={alan.baslik}
              aciklama={alan.aciklama}
              secim={secimler[alan.key]}
              hata={dokunulan[alan.key] ? hatalar[alan.key] : undefined}
              onSelect={(file) => handleSelect(alan.key, file)}
              onClear={() => handleClear(alan.key)}
            />
          ))}
        </div>

        {/* ========================= KARŞI TARAF BELGELERİ ========================= */}
        <div className="space-y-6">
          <h2 className="text-[15px] font-semibold text-slate">
            Karşı Taraf Belgeleri{" "}
            <span className="text-[12px] font-normal text-slate/80">
              (opsiyonel)
            </span>
          </h2>
          {SAG_ALANLAR.map((alan) => (
            <FotoAlani
              key={alan.key}
              baslik={alan.baslik}
              aciklama={alan.aciklama}
              secim={secimler[alan.key]}
              hata={dokunulan[alan.key] ? hatalar[alan.key] : undefined}
              onSelect={(file) => handleSelect(alan.key, file)}
              onClear={() => handleClear(alan.key)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 pt-1">
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
          Belgeleriniz yalnızca bu başvuru için kullanılır.
        </p>
      </div>
    </form>
  );
}
