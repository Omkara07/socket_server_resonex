/*
  Warnings:

  - Added the required column `img` to the `Stream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "img" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
