/*
  Warnings:

  - The primary key for the `CurrentStream` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `CurrentStream` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CurrentStream` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomId]` on the table `CurrentStream` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `CurrentStream` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `roomId` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CurrentStream" DROP CONSTRAINT "CurrentStream_pkey",
DROP COLUMN "password",
DROP COLUMN "userId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT,
ADD CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "roomId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hostId" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_roomMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_roomMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_roomMembers_B_index" ON "_roomMembers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_roomId_key" ON "CurrentStream"("roomId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roomMembers" ADD CONSTRAINT "_roomMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roomMembers" ADD CONSTRAINT "_roomMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
