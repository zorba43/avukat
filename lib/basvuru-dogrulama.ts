import { prisma } from "@/lib/prisma";

/**
 * Ek belge yükleme akışında kimlik doğrulaması için kullanılır — hem
 * /api/basvuru-bul hem /api/ek-belge bu fonksiyonu çağırır (ikincisi, ilk
 * adıma güvenmek yerine yüklemeden hemen önce KENDİSİ tekrar doğrular).
 * Eşleşmezse null döner; hangi alanın (numara mı telefon mu) hatalı olduğu
 * güvenlik gereği ayırt edilmez.
 */
export async function basvuruDogrulaVeBul(basvuruNo: string, telefonSon4: string) {
  const kayit = await prisma.kazaBildirimi.findUnique({ where: { basvuruNo } });
  if (!kayit || !kayit.telefon.endsWith(telefonSon4)) {
    return null;
  }
  return kayit;
}
