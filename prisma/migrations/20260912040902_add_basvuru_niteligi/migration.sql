/*
  Warnings:

  - Added the required column `basvuruNiteligi` to the `KazaBildirimi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KazaBildirimi" ADD COLUMN     "basvuruNiteligi" TEXT NOT NULL;
