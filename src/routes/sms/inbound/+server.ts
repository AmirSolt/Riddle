import type { RequestHandler } from '@sveltejs/kit'
import { getProfileByTwilioId, createProfile, createMessage, createMError } from '$lib/server/services/db';
import TwilioSDK from 'twilio';
import type { Config, MError } from '@prisma/client';
import { MessageDir, MessageType } from '@prisma/client';
import { createResponseMessage, handleIncomingMessage } from '$lib/server/services/state.js';
import { getChatResponse } from '$lib/server/services/chat.js';


export const POST = async (event) => {

    console.log("message recieved")


    const text = await event.request.text();
    const params = Object.fromEntries(new URLSearchParams(text));
    const { Body:incomingMessageStr, From:senderTwilioId } = params

    console.log(`= incomingMessageStr:${incomingMessageStr} senderTwilioId:${senderTwilioId}`)
    
    const twimlResponse = new TwilioSDK.twiml.MessagingResponse();


    try{        

  
        const responseStr = await getChatResponse(event, senderTwilioId, incomingMessageStr)

        if(responseStr){
            twimlResponse.message(responseStr)
        }
        
        return new Response(twimlResponse.toString(), {
            headers: {
            'Content-Type': 'application/xml',
            },
        });



    }catch(err){
        console.log("Error:",err)

        const config:Config = event.locals.config
        let profile = await getProfileByTwilioId(config, senderTwilioId)
        if(profile == null){
            profile = await createProfile(config, senderTwilioId)
        }

        await createMError(
            config,
            profile,
            "Error:",err
        )

        const responseBody = `Error: Server encoutered an error. A notification has been sent to the developer.`
        twimlResponse.message(responseBody)

        return new Response(twimlResponse.toString(), {
            headers: {
            'Content-Type': 'application/xml',
            },
        });

    }
};




