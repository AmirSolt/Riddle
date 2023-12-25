
import type { Config } from '@prisma/client';
import type { MProfile } from '../../customTypes';



export function getIncomingMessage(config:Config, profile:MProfile, incomingMessageStr:string):IncomingMessage|null{
    const chosenOptionId = profile.messages.slice(-1)[0].option_ids.find(optId=>optId.toLowerCase()===incomingMessageStr.toLowerCase())
    if(chosenOptionId){
        return {
            body:incomingMessageStr,
            optionId:chosenOptionId
        }
    }
    return null
}



export function getResponseMessage(config:Config, profile:MProfile, incomingMessage:IncomingMessage):ResponseMessage{


    
}