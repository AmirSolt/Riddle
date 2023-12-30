import type { RequestEvent } from "@sveltejs/kit"
import { getProfile, createProfile, createMessage, createMError } from '$lib/server/services/db';
import type { Config, MError } from '@prisma/client';
import { createResponseMessage, handleIncomingMessage } from '$lib/server/services/state.js';


export async function getChatResponse(event:RequestEvent, senderId:string, incomingMessageStr:string):Promise<string|null>{
    // preemptive cleaning
    if(incomingMessageStr==null){
        return null
    }

    // init
    const config:Config = event.locals.config
    let profile = await getProfile(config, senderId)
    if(profile == null){
        profile = await createProfile(config, senderId)
    }

    // handle incoming message
    await handleIncomingMessage(config, profile, incomingMessageStr)

    // handle response
    const responseMessageStr = await createResponseMessage(config, profile, incomingMessageStr)
    
    return responseMessageStr
}