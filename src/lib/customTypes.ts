import type {  ConfigType, Message, MessageDir, Config, Profile, Game } from "@prisma/client";

export type MProfile = (Profile & { games: Game[]; } & { messages: Message[]; })

