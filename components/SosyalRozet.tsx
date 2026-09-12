import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Sosyal medya / web sitesi rozeti — dairesel, marka rengi zeminli, ince yarı
 * saydam beyaz kenarlıklı (cam/premium his) ve kabartma gölgeli. Hover'da
 * ölçek + gölge büyür (0.15s, abartısız). Header'da (32px) ve mobil menüde
 * (40px) aynı bileşen `size` prop'uyla kullanılır.
 */
export default function SosyalRozet({
  href,
  label,
  className,
  children,
  internal = false,
  size = 32,
}: {
  href: string;
  label: string;
  className: string;
  children: ReactNode;
  internal?: boolean;
  size?: number;
}) {
  const rozetSinifi = [
    "flex shrink-0 items-center justify-center rounded-full",
    "border border-white/15",
    "shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-[transform,box-shadow] duration-150 ease-out",
    "hover:scale-[1.08] hover:shadow-[0_4px_14px_rgba(0,0,0,0.18)]",
    className,
  ].join(" ");
  const style = { width: size, height: size };

  if (internal) {
    return (
      <Link href={href} aria-label={label} className={rozetSinifi} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} aria-label={label} className={rozetSinifi} style={style}>
      {children}
    </a>
  );
}
