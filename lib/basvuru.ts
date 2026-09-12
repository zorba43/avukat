import { slugifyIsim } from "@/lib/slug";

/**
 * Kullanıcıya gösterilen kısa başvuru kodu — "GH-2026-4821" biçiminde.
 * Benzersizlik veritabanı seviyesinde (@unique) garanti edilir; çağıran taraf
 * (bkz. app/api/kaza-bildirimi) çakışma durumunda (Prisma P2002) bu
 * fonksiyonu tekrar çağırıp yeniden dener.
 */
export function uretBasvuruNo(tarih: Date = new Date()): string {
  const yil = tarih.getFullYear();
  const rastgele = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `GH-${yil}-${rastgele}`;
}

/**
 * Bir başvurunun Vercel Blob'daki klasör önekini, kayıttaki ad/createdAt/id
 * bilgilerinden DETERMİNİSTİK olarak yeniden hesaplar (bkz. TamamlaForm.tsx —
 * ilk yüklemede aynı formülle üretilir). Böylece klasör yolu ayrıca
 * veritabanında saklanmaz; ek belge yüklerken de aynı klasöre düşer.
 */
export function basvuruKlasoru({
  ad,
  createdAt,
  id,
}: {
  ad: string;
  createdAt: Date;
  id: string;
}): string {
  const gun = createdAt.toISOString().slice(0, 10);
  const kisaKod = id.slice(0, 6);
  return `basvurular/${slugifyIsim(ad)}-${gun}-${kisaKod}`;
}
