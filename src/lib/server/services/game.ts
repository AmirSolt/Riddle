
import type { Config } from '@prisma/client';
import type { MProfile } from '../../customTypes';




const GAME_OPTION_ID = "game"



export function getIncomingMessage(config:Config, profile:MProfile, incomingMessageStr:string):IncomingMessage|null{
    const lastMessageIds = profile.messages.slice(-1)[0].option_ids

    if(lastMessageIds.length===1 && lastMessageIds[0]===GAME_OPTION_ID){
        return {
            body:incomingMessageStr,
            optionId:incomingMessageStr
        } 
    }

    const chosenOptionId = lastMessageIds.find(optId=>optId.toLowerCase()===incomingMessageStr.toLowerCase())
    if(chosenOptionId){
        return {
            body:incomingMessageStr,
            optionId:chosenOptionId
        }
    }
    return null
}



export function getResponseMessage(config:Config, profile:MProfile, incomingMessage:IncomingMessage):ResponseMessage{
    const lastMessageIds = profile.messages.slice(-1)[0].option_ids

    if(lastMessageIds.length===1 && lastMessageIds[0]===GAME_OPTION_ID){
        // run game
        return {
            body:incomingMessageStr,
            optionId:incomingMessageStr
        } 
    }


    return tools[incomingMessage.optionId].func(config, profile)

}






const tools:{[key: string]:Tool} = {

    start:{
        description:"",
        func:(config:Config, profile:MProfile):ResponseMessage=>{
                
            return {
                body:"",
                options:[],
            }
        }
    },
    store:{
        description:"",
        func:(config:Config, profile:MProfile):ResponseMessage=>{
            
            return {
                body:"",
                options:[],
            }
        }
    },
    lead:{
        description:"",
        func:(config:Config, profile:MProfile):ResponseMessage=>{
            
            return {
                body:"",
                options:[],
            }
        }
    },
    easy:{
        description:"",
        func:(config:Config, profile:MProfile):ResponseMessage=>{
            
            return {
                body:"",
                options:[],
            }
        }
    },
    medium:{
        description:"",
        func:(config:Config, profile:MProfile):ResponseMessage=>{
            
            return {
                body:"",
                options:[],
            }
        }
    },
    hard:{
        description:"",
        func:(config:Config, profile:MProfile):ResponseMessage=>{
            
            return {
                body:"",
                options:[],
            }
        }
    },
}

if(GAME_OPTION_ID in tools){
    throw new Error(`Error: services/games.ts || ${GAME_OPTION_ID} should not be in tools as a key`)
}



interface Tool{
    description:string
    func:Function
}