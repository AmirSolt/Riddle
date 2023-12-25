import type {  ConfigType, Message, MessageDir, MessageRole, Config, Profile } from "@prisma/client";

export type MProfile = (Profile & { messages: Message[]; } & { _count: { messages: number } })

