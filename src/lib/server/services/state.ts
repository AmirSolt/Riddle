import { type Config, type Profile, MessageDir, MessageType } from "@prisma/client";
import { createMessage, getLastActiveMessage } from "./db";



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

        await createMessage(
            config,
            profile,
            MessageDir.OUTBOUND,
            "Intro + menu",
            true,
            MessageType.MENU,
            {} // menu
        )
        return "Intro + menu"
    }

    if(lastActiveMessage?.message_type === MessageType.MENU){

    }




    return ""
}