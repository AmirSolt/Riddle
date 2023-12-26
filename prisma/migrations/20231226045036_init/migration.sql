/*
  Warnings:

  - Added the required column `credit_cost` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points_to_win` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "credit_cost" INTEGER NOT NULL,
ADD COLUMN     "is_won" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "points_to_win" INTEGER NOT NULL;
