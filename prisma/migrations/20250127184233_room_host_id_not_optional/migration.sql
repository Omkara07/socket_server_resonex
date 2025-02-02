/*
  Warnings:

  - Made the column `hostId` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_hostId_fkey";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "hostId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
