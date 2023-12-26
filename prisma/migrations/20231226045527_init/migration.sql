-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "easy_credit_cost" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "easy_points_to_win" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hard_credit_cost" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "hard_points_to_win" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "medium_credit_cost" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "medium_points_to_win" INTEGER NOT NULL DEFAULT 2;
