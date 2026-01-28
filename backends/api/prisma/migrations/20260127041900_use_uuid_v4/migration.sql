/*
  Warnings:

  - The primary key for the `Logbook` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Logitem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Logbook" DROP CONSTRAINT "Logbook_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Logitem" DROP CONSTRAINT "Logitem_logbookId_fkey";

-- AlterTable
ALTER TABLE "Logbook" DROP CONSTRAINT "Logbook_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "ownerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Logbook_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Logbook_id_seq";

-- AlterTable
ALTER TABLE "Logitem" DROP CONSTRAINT "Logitem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "logbookId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Logitem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Logitem_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Logbook" ADD CONSTRAINT "Logbook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logitem" ADD CONSTRAINT "Logitem_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "Logbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
