-- AlterTable
ALTER TABLE "KazaBildirimi" ADD COLUMN     "basvuruNo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "KazaBildirimi_basvuruNo_key" ON "KazaBildirimi"("basvuruNo");
