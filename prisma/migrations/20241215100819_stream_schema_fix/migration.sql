/*
  Warnings:

  - You are about to drop the column `extractedUrl` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `tyope` on the `Stream` table. All the data in the column will be lost.
  - Added the required column `extractedId` to the `Stream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "extractedUrl",
DROP COLUMN "tyope",
ADD COLUMN     "extractedId" TEXT NOT NULL,
ADD COLUMN     "type" "StreamType" NOT NULL;
