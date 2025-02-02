-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'Credentials';

-- AlterTable
ALTER TABLE "CurrentStream" ADD COLUMN     "img" TEXT,
ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;
