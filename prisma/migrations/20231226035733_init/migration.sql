/*
  Warnings:

  - You are about to drop the column `answer` on the `Game` table. All the data in the column will be lost.
  - Added the required column `phrase` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "answer",
ADD COLUMN     "phrase" TEXT NOT NULL;
