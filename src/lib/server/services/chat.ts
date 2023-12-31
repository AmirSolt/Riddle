import type { RequestEvent } from "@sveltejs/kit"
import { getProfileByTwilioId, createProfile, createMessage, createMError } from '$lib/server/services/db';
import type { MessageType, Config, Profile, MessageDir } from '@prisma/client';
import { createResponseMessage, handleIncomingMessage } from '$lib/server/services/state.js';
import { client } from "../clients/twilio";
import { TWILIO_PHONE_NUMBER } from "$env/static/private";


export async function getChatResponse(event:RequestEvent, senderId:string, incomingMessageStr:string):Promise<string|null>{
    // preemptive cleaning
    if(incomingMessageStr==null){
        return null
    }

    // init
    const config:Config = event.locals.config
    let profile = await getProfileByTwilioId(config, senderId)
    if(profile == null){
        profile = await createProfile(config, senderId)
    }

    // handle incoming message
    await handleIncomingMessage(config, profile, incomingMessageStr)

    // handle response
    const responseMessageStr = await createResponseMessage(config, profile, incomingMessageStr)
    
    return responseMessageStr
}


export async function sendSMS(
    config: Config,
    profile: Profile,
    messageDir: MessageDir,
    content: string,
    isActive:boolean,
    messageType: MessageType,
    extraJson: any | undefined | null = undefined,
    image_urls: string[] = []
){

    createMessage(
        config,
        profile,
        messageDir,
        content,
        isActive,
        messageType,
        extraJson,
        image_urls
    )

    try{
        await client.messages.create({
            from: TWILIO_PHONE_NUMBER,
            body: content,
            to:profile.twilio_id,
            mediaUrl: image_urls
        });
    }catch(err){
        console.log(`SMS ERROR: ${err}`)
    }


}