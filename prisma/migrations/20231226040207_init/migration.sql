/*
  Warnings:

  - You are about to drop the column `chatbot_system_message` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `chatbot_temperature` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `load_message_to_client_count` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `message_char_limit` on the `Config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Config" DROP COLUMN "chatbot_system_message",
DROP COLUMN "chatbot_temperature",
DROP COLUMN "load_message_to_client_count",
DROP COLUMN "message_char_limit",
ADD COLUMN     "easy_game_given_count" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "hard_game_given_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "medium_game_given_count" INTEGER NOT NULL DEFAULT 3;
