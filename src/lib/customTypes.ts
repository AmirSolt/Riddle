import type {  ConfigType, Message, MessageDir, Config, Profile } from "@prisma/client";

export type MProfile = (Profile & { messages: Message[]; })

