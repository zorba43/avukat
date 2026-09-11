-- CreateTable
CREATE TABLE "KazaBildirimi" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "kazaTarihi" TIMESTAMP(3) NOT NULL,
    "kazaDurumu" TEXT NOT NULL,
    "ruhsatUrl" TEXT NOT NULL,
    "ehliyetOnUrl" TEXT NOT NULL,
    "ehliyetArkaUrl" TEXT NOT NULL,
    "kazaRaporuUrls" TEXT[],
    "fotograflarUrls" TEXT[],
    "kaynak" TEXT NOT NULL,
    "kaynakDetay" TEXT,

    CONSTRAINT "KazaBildirimi_pkey" PRIMARY KEY ("id")
);
