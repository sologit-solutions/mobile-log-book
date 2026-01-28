/*
  Warnings:

  - Added the required column `updatedAt` to the `Logbook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Logitem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Logbook" DROP CONSTRAINT "Logbook_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Logitem" DROP CONSTRAINT "Logitem_logbookId_fkey";

-- AlterTable
ALTER TABLE "Logbook" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Logitem" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Logbook" ADD CONSTRAINT "Logbook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logitem" ADD CONSTRAINT "Logitem_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "Logbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
