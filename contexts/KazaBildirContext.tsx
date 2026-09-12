"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * "Kaza Bildir" akışının 5 adımı arasında GERÇEK veriyi (dosyalar dahil) bellekte
 * taşır. sessionStorage'ın aksine File nesnelerinin kendisini tutabilir — çünkü
 * Next.js'te adımlar arası geçiş (router.push) sayfayı yeniden yüklemez, JS
 * çalışma zamanı canlı kalır. Tarayıcı yenilenirse (F5) bu veri kaybolur; bu,
 * çok adımlı formlarda kabul edilen bir sınırlamadır.
 *
 * Adım bileşenleri kendi iç state'lerini (önizleme, doğrulama) olduğu gibi
 * korur; yalnızca geçerli bir "Devam Et/Gönder" anında ilgili setAdımN
 * çağrılarak veri buraya yazılır.
 */

export type Adim1Verisi = {
  ad: string;
  telefon: string;
  tarih: string;
  basvuruNiteligi: string;
  kazaDurumu: string;
};

export type Adim2Verisi = {
  ruhsat: File;
  ehliyetOn: File;
  ehliyetArka: File;
  // Karşı taraf belgeleri — opsiyonel, kaza anında elde olmayabilir.
  karsiTarafRuhsat?: File;
  karsiTarafEhliyetOn?: File;
  karsiTarafEhliyetArka?: File;
};

export type Adim5Verisi = {
  kaynak: string;
  kaynakDetay?: string;
};

type KazaBildirState = {
  adim1: Adim1Verisi | null;
  adim2: Adim2Verisi | null;
  adim3: File[]; // Kaza raporu belgeleri (1-5 arası, PDF veya görsel)
  adim4: File[]; // Olay yeri fotoğrafları (3-20 arası)
  adim5: Adim5Verisi | null;
};

type KazaBildirContextValue = KazaBildirState & {
  setAdim1: (veri: Adim1Verisi) => void;
  setAdim2: (veri: Adim2Verisi) => void;
  setAdim3: (veri: File[]) => void;
  setAdim4: (veri: File[]) => void;
  setAdim5: (veri: Adim5Verisi) => void;
  /** Tüm adımlar dolu mu? (Adım 5'te göndermeden önce sağlık kontrolü için.) */
  tamamMi: () => boolean;
};

const KazaBildirContext = createContext<KazaBildirContextValue | null>(null);

export function KazaBildirProvider({ children }: { children: ReactNode }) {
  const [adim1, setAdim1] = useState<Adim1Verisi | null>(null);
  const [adim2, setAdim2] = useState<Adim2Verisi | null>(null);
  const [adim3, setAdim3] = useState<File[]>([]);
  const [adim4, setAdim4] = useState<File[]>([]);
  const [adim5, setAdim5] = useState<Adim5Verisi | null>(null);

  const tamamMi = useCallback(
    () => Boolean(adim1 && adim2 && adim3.length >= 1 && adim4.length >= 3 && adim5),
    [adim1, adim2, adim3, adim4, adim5],
  );

  const value = useMemo<KazaBildirContextValue>(
    () => ({
      adim1,
      adim2,
      adim3,
      adim4,
      adim5,
      setAdim1,
      setAdim2,
      setAdim3,
      setAdim4,
      setAdim5,
      tamamMi,
    }),
    [adim1, adim2, adim3, adim4, adim5, tamamMi],
  );

  return (
    <KazaBildirContext.Provider value={value}>{children}</KazaBildirContext.Provider>
  );
}

export function useKazaBildir() {
  const ctx = useContext(KazaBildirContext);
  if (!ctx) {
    throw new Error("useKazaBildir(), <KazaBildirProvider> içinde kullanılmalı.");
  }
  return ctx;
}
