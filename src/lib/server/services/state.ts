
import { Difficulty, type Config, MessageDir } from '@prisma/client';
import type { MProfile } from '../../customTypes';
import { createGame, getPhrase } from './db';
import { tick } from './game';
import { error } from '@sveltejs/kit';




const GAME_OPTION_ID = "game"



export async function getIncomingMessage(config: Config, profile: MProfile, incomingMessageStr: string): Promise<IncomingMessage | null> {
    const lastOutboundMessage = profile.messages.slice(-1)[0]
    
    if(lastOutboundMessage==null){
        return {
            body: incomingMessageStr,
            optionId: null
        }
    }
    if(lastOutboundMessage.message_dir !== MessageDir.OUTBOUND){
        throw error(500, "Error: state.ts finding last outbound message error!")
    }
    if(lastOutboundMessage.option_ids.length <= 0){
        throw error(500, "Error: state.ts last outbound message has no options")
    }
    
    const lastMessageOptionIds = lastOutboundMessage.option_ids

    if (lastMessageOptionIds.length === 1 && lastMessageOptionIds[0] === GAME_OPTION_ID) {
        return {
            body: incomingMessageStr,
            optionId: null
        }
    }

    const chosenOptionId = lastMessageOptionIds.find(optId => optId.toLowerCase() === incomingMessageStr.toLowerCase())
    if (chosenOptionId) {
        return {
            body: incomingMessageStr,
            optionId: chosenOptionId
        }
    }
    return null
}



export async function getResponseMessage(config: Config, profile: MProfile, incomingMessage: IncomingMessage): Promise<ResponseMessage> {
    const lastOutboundMessage = profile.messages.slice(-1)[0]
    
    if(lastOutboundMessage==null){
        return {
            body: `Wanna play a game?\nchoose:\n${optionsToStr(normalOptions)}`,
            options:normalOptions,
        }
    }
    if(lastOutboundMessage.message_dir !== MessageDir.OUTBOUND){
        throw error(500, "Error: state.ts finding last outbound message error!")
    }
    if(lastOutboundMessage.option_ids.length <= 0){
        throw error(500, "Error: state.ts last outbound message has no options")
    }
    
    const lastMessageOptionIds = lastOutboundMessage.option_ids

    if (lastMessageOptionIds.length === 1 && lastMessageOptionIds[0] === GAME_OPTION_ID) {

        profile = await tick(
            config,
            profile,
            incomingMessage.body,
        )
        const lastGame = profile.games.slice(-1)[0]

        if (lastGame.is_active) {
            const censoredPhrase = censorPhrase(lastGame.phrase, [...lastGame.given, ...lastGame.guesses])
            return {
                body: `${censoredPhrase}`,
                options: [
                    {
                        id: GAME_OPTION_ID,
                        body: ""
                    }
                ],
            }
        }

        let endMessage = lastGame.is_won ?
            `Win ${lastGame.phrase}` :
            `Lost ${lastGame.phrase}`


        return {
            body: `${endMessage}\n${optionsToStr(normalOptions)}`,
            options:normalOptions,
        }

    }

    return await tools[incomingMessage.optionId].func(config, profile)

}






const tools: { [key: string]: Tool } = {

    start: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            const options = [
                {
                    id: "easy",
                    body: tools.easy.description,
                },
                {
                    id: "medium",
                    body: tools.medium.description,
                },
                {
                    id: "hard",
                    body: tools.hard.description,
                },
            ]
            return {
                body: `Choose a difficulty: \n${optionsToStr(options)}`,
                options,
            }
        }
    },
    store: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {

            return {
                body: "",
                options: [],
            }
        }
    },
    lead: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {

            return {
                body: "",
                options: [],
            }
        }
    },
    easy: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            return await handleGame(config, profile, Difficulty.EASY)
        }
    },
    medium: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            return await handleGame(config, profile, Difficulty.MEDIUM)
        }
    },
    hard: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            return await handleGame(config, profile, Difficulty.HARD)
        }
    },
}

if (GAME_OPTION_ID in tools) {
    throw new Error(`Error: services/games.ts || ${GAME_OPTION_ID} should not be in tools as a key`)
}


interface Tool {
    description: string
    func: (config: Config, profile: MProfile) => Promise<ResponseMessage>
}


const normalOptions = [
    {
        id:"start",
        body:tools.start.description
    },
    {
        id:"store",
        body:tools.store.description
    },
    {
        id:"lead",
        body:tools.lead.description
    },
]

function optionsToStr(options:Option[]){
    return options.map(opt => `${opt.id}: ${opt.body}`).join("\n")
}



async function handleGame(config: Config, profile: MProfile, difficulty: Difficulty) {
    const phrase = await getPhrase(config)

    profile = await createGame(
        config,
        profile,
        phrase.content,
        difficulty,
    )

    const lastGame = profile.games.slice(-1)[0]
    if (!lastGame.is_active) {
        return {
            body: `Not enough credit\n credits:${profile.credit}\nActions:${optionsToStr(normalOptions)}`,
            options:normalOptions
        }
    }

    const censoredPhrase = censorPhrase(lastGame.phrase, [...lastGame.given, ...lastGame.guesses])
    return {
        body: `${censoredPhrase}`,
        options: [
            {
                id: GAME_OPTION_ID,
                body: ""
            }
        ],
    }
}


function censorPhrase(phrase: string, revealChars: string[]): string {
    revealChars = revealChars.map(ch => ch.toLowerCase())
    const safeChars = revealChars.join('').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regexPattern = new RegExp(`[^ ${safeChars}]`, 'g');

    return phrase.toLowerCase().replace(regexPattern, '-');
}
