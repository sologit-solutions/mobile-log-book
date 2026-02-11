/*
  Warnings:

  - Added the required column `version` to the `Logitem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Logbook" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Logitem" ADD COLUMN     "version" INTEGER NOT NULL;
