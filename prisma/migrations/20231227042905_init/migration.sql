/*
  Warnings:

  - You are about to drop the column `is_passive` on the `Message` table. All the data in the column will be lost.
  - Added the required column `is_active` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "is_passive",
ADD COLUMN     "is_active" BOOLEAN NOT NULL;
