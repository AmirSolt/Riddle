-- CreateEnum
CREATE TYPE "MessageDir" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('MENU', 'GAME', 'NOTIF', 'USER');

-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('FREE', 'TIER_ONE');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "CreditTransferReason" AS ENUM ('PURCHASE', 'GAME');

-- CreateTable
CREATE TABLE "Config" (
    "id" "ConfigType" NOT NULL,
    "easy_game_given_count" INTEGER NOT NULL DEFAULT 5,
    "medium_game_given_count" INTEGER NOT NULL DEFAULT 3,
    "hard_game_given_count" INTEGER NOT NULL DEFAULT 1,
    "easy_points_to_win" INTEGER NOT NULL DEFAULT 1,
    "medium_points_to_win" INTEGER NOT NULL DEFAULT 2,
    "hard_points_to_win" INTEGER NOT NULL DEFAULT 4,
    "easy_credit_cost" INTEGER NOT NULL DEFAULT 1,
    "medium_credit_cost" INTEGER NOT NULL DEFAULT 2,
    "hard_credit_cost" INTEGER NOT NULL DEFAULT 4,
    "game_guess_count" INTEGER NOT NULL DEFAULT 4,
    "leaderboard_top_count" INTEGER NOT NULL DEFAULT 20,
    "disclaimer_repeat_message_count" INTEGER NOT NULL DEFAULT 150,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twilio_id" TEXT NOT NULL,
    "credit" INTEGER NOT NULL DEFAULT 3,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL,
    "profile_id" TEXT NOT NULL,
    "message_dir" "MessageDir" NOT NULL,
    "extra_json" JSONB,
    "image_urls" TEXT[],

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phrase" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Phrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phrase" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "is_won" BOOLEAN NOT NULL,
    "points_to_win" INTEGER NOT NULL,
    "credit_cost" INTEGER NOT NULL,
    "given_chars" TEXT[],
    "guessed_chars" TEXT[],
    "profile_id" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransfer" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credit_count" INTEGER NOT NULL,
    "reason" "CreditTransferReason" NOT NULL,
    "profile_id" TEXT NOT NULL,

    CONSTRAINT "CreditTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MError" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "extra_json" JSONB,

    CONSTRAINT "MError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_twilio_id_key" ON "Profile"("twilio_id");

-- CreateIndex
CREATE INDEX "Profile_twilio_id_idx" ON "Profile" USING HASH ("twilio_id");

-- CreateIndex
CREATE INDEX "Profile_points_idx" ON "Profile"("points");

-- CreateIndex
CREATE INDEX "Message_created_at_idx" ON "Message"("created_at");

-- CreateIndex
CREATE INDEX "MError_created_at_idx" ON "MError"("created_at");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransfer" ADD CONSTRAINT "CreditTransfer_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MError" ADD CONSTRAINT "MError_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
