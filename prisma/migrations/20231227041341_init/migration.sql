/*
  Warnings:

  - Added the required column `is_passive` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "is_passive" BOOLEAN NOT NULL;
