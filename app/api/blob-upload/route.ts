import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Kaza Bildir formundaki dosyalar (ruhsat/ehliyet, kaza raporu, olay yeri
 * fotoğrafları) tarayıcıdan doğrudan Vercel Blob'a yüklenir — büyük toplam
 * boyut (en fazla 28 dosya x 10 MB) sunucu fonksiyonunun istek boyutu
 * sınırını aşabileceği için dosyalar hiçbir zaman bu API route'un gövdesinden
 * geçmez. Bu route yalnızca yükleme için kısa ömürlü bir token imzalar.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "application/pdf"],
        maximumSizeInBytes: 10 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Şimdilik ek bir işlem gerekmiyor; kayıt /api/kaza-bildirimi'nde oluşturulur.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
