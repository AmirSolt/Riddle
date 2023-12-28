import { type Config, type Profile, MessageDir, MessageType } from "@prisma/client";
import { createMessage, getLastActiveMessage } from "./db";
import { getNormalOptions, optionsToStr } from "./states/helper";
import { getMenuResponse } from "./states/menu";
import { getGameResponse } from "./states/game";


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


    console.log("lastActiveMessage",lastActiveMessage.id)


    if(lastActiveMessage.message_type === MessageType.MENU){
        return await getMenuResponse(config, profile, incomingMessageStr, lastActiveMessage)
    }

    if(lastActiveMessage.message_type === MessageType.GAME){
        return await getGameResponse(config, profile, incomingMessageStr, lastActiveMessage)
    }

    return null
}