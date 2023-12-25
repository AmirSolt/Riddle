-- CreateEnum
CREATE TYPE "MessageDir" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('FREE', 'TIER_ONE');

-- CreateTable
CREATE TABLE "Config" (
    "id" "ConfigType" NOT NULL,
    "chatbot_system_message" TEXT NOT NULL DEFAULT '',
    "chatbot_temperature" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "disclaimer_repeat_message_count" INTEGER NOT NULL DEFAULT 150,
    "message_char_limit" INTEGER NOT NULL DEFAULT 250,
    "load_message_to_client_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twilio_id" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "option_ids" TEXT[],
    "profile_id" TEXT NOT NULL,
    "message_dir" "MessageDir" NOT NULL,
    "extra_json" JSONB,
    "image_urls" TEXT[],

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "Message_created_at_idx" ON "Message"("created_at");

-- CreateIndex
CREATE INDEX "MError_created_at_idx" ON "MError"("created_at");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MError" ADD CONSTRAINT "MError_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
