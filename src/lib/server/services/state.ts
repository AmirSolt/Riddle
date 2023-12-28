import { type Config, type Profile, MessageDir, MessageType } from "@prisma/client";
import { createMessage, getLastActiveMessage } from "./db";
import { getNormalOptions, optionsToStr } from "./states/helper";


export async function handleIncomingMessage(config:Config, profile:Profile, incomingMessageStr:string):Promise<void>{

    await createMessage(
        config,
        profile,
        MessageDir.INBOUND,
        incomingMessageStr,
        false,
        MessageType.USER,
    )
}


export async function createResponseMessage(config:Config, profile:Profile, incomingMessageStr:string):Promise<string|null>{

    const lastActiveMessage = await getLastActiveMessage(config, profile)

    if(lastActiveMessage==null){

        const normalOptions = getNormalOptions(config, profile)
        const message = await createMessage(
            config,
            profile,
            MessageDir.OUTBOUND,
            `Intro\n${optionsToStr(normalOptions)}`,
            true,
            MessageType.MENU,
            normalOptions,
        )
        return message.content
    }

    if(lastActiveMessage?.message_type === MessageType.MENU){

    }




    return ""
}