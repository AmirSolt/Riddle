import type {  ConfigType, Message, MessageDir, Config, Profile, Game } from "@prisma/client";



// lastOOMessage => last Outbound Optioned message
export type MProfile = (Profile & { lastGame: Game|null; } & { lastOOMessage: Message|null; })

