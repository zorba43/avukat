-- AlterTable
ALTER TABLE "KazaBildirimi" ADD COLUMN     "digerEvrakUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ifadeUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "saglikRaporuUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
