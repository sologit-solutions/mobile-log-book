/*
  Warnings:

  - You are about to alter the column `registration` on the `Logbook` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `vesselType` on the `Logbook` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.

*/
-- AlterTable
ALTER TABLE "Logbook" ALTER COLUMN "registration" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "vesselType" SET DATA TYPE VARCHAR(64);
