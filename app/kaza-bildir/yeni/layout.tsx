import { KazaBildirProvider } from "@/contexts/KazaBildirContext";

/**
 * "Kaza Bildir" akışının tüm adımlarını (1-5) sarmalar. KazaBildirProvider
 * sayesinde adımlar arası dosyalar ve form verisi tarayıcı yenilenmediği
 * sürece bellekte taşınır — bkz. contexts/KazaBildirContext.tsx.
 */
export default function KazaBildirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KazaBildirProvider>{children}</KazaBildirProvider>;
}
