/*
  Warnings:

  - You are about to drop the column `location` on the `Logitem` table. All the data in the column will be lost.
  - You are about to alter the column `body` on the `Logitem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.
  - Made the column `title` on table `Logitem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Logitem" DROP COLUMN "location",
ADD COLUMN     "barometer" DOUBLE PRECISION,
ADD COLUMN     "course" DOUBLE PRECISION,
ADD COLUMN     "crew" INTEGER,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "speedOverGround" DOUBLE PRECISION,
ADD COLUMN     "speedThroughWater" DOUBLE PRECISION,
ADD COLUMN     "windSpeed" DOUBLE PRECISION,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "body" SET DATA TYPE VARCHAR(1024);
