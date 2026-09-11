import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Fraunces & Inter değişken (variable) fontlardır; next/font bunları tam eksen
// aralığıyla getirir. Fraunces'te opsz ekseni açık bırakıldı (PROJE-SPEC B.3),
// ihtiyaç duyulan ağırlıklar (Fraunces 400/500/600, Inter 400/500/600/700)
// değişken aralık içinde kapsanır.
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gökçe Hukuk Bürosu — Kaza Bildirimi",
  description:
    "Trafik kazası geçiren kuryeler için online kaza bildirim sistemi. Kazanızı bildirin, haklarınızı biz koruyalım.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
