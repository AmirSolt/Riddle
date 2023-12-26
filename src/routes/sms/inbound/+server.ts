import type { RequestHandler } from '@sveltejs/kit'
import { getProfile, createProfile, createMessage, createMError } from '$lib/server/services/db';
import TwilioSDK from 'twilio';
import type { Config, MError } from '@prisma/client';
import { MessageDir } from '@prisma/client';
import { getIncomingMessage, getResponseMessage } from '../../../lib/server/services/state';


export const POST = async (event) => {

    console.log("message recieved")


    const text = await event.request.text();
    const params = Object.fromEntries(new URLSearchParams(text));
    const { Body:incomingMessageStr, From:senderTwilioId } = params

    console.log(`message= incomingMessageStr:${incomingMessageStr} senderTwilioId:${senderTwilioId}`)
    
    const twimlResponse = new TwilioSDK.twiml.MessagingResponse();

    // try{        
        const config:Config = event.locals.config
        let profile = await getProfile(config, senderTwilioId)
        if(profile == null){
            profile = await createProfile(config, senderTwilioId)
        }

        console.log(`profile: ${JSON.stringify(profile, null, 2)}`)

        const incomingMessage = await getIncomingMessage(config, profile, incomingMessageStr)
        if(incomingMessage==null){
            console.log("incoming message failed")
            return new Response(twimlResponse.toString(), {
                headers: {
                'Content-Type': 'application/xml',
                },
            });
        }

        const responseMessage = await getResponseMessage(config, profile, incomingMessage)

        if(responseMessage.body){
            await createMessage(
                config,
                profile,
                MessageDir.INBOUND,
                incomingMessage.body,
                incomingMessage.optionId?[incomingMessage.optionId]:[]
            )
            await createMessage(
                config,
                profile,
                MessageDir.OUTBOUND,
                responseMessage.body,
                responseMessage.options.map(opt=>opt.id)
            )
            twimlResponse.message(responseMessage.body)
        }
        
        return new Response(twimlResponse.toString(), {
            headers: {
            'Content-Type': 'application/xml',
            },
        });



    // }catch(err){
    //     console.log("Error:",err)

    //     const config:Config = event.locals.config
    //     let profile = await getProfile(config, senderTwilioId)
    //     if(profile == null){
    //         profile = await createProfile(config, senderTwilioId)
    //     }

    //     await createMError(
    //         config,
    //         profile,
    //         "Error:",err
    //     )

    //     const responseBody = `Error: Server encoutered an error. A notification has been sent to the developer.`
    //     twimlResponse.message(responseBody)

    //     return new Response(twimlResponse.toString(), {
    //         headers: {
    //         'Content-Type': 'application/xml',
    //         },
    //     });

    // }
};




