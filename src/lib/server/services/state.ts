
import { Difficulty, type Config, MessageDir } from '@prisma/client';
import type { MProfile } from '../../customTypes';
import { createGame, getPhrase } from './db';
import { tick } from './game';
import { error } from '@sveltejs/kit';




const GAME_OPTION_ID = "game"



export async function getIncomingMessage(config: Config, profile: MProfile, incomingMessageStr: string): Promise<IncomingMessage | null> {
    
    
    
    if(profile.lastOOMessage==null){
        return {
            body: incomingMessageStr,
            optionId: null
        }
    }
    
    const lastMessageOptionIds = profile.lastOOMessage.option_ids

    if (lastMessageOptionIds.length === 1 && lastMessageOptionIds[0] === GAME_OPTION_ID) {
        return {
            body: incomingMessageStr,
            optionId: null
        }
    }

    console.log("lastMessageOptionIds",lastMessageOptionIds)

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
    if(profile.lastOOMessage==null){
        return {
            body: `Wanna play a game?\nchoose:\n${optionsToStr(normalOptions)}`,
            options:normalOptions,
        }
    }

    const lastMessageOptionIds = profile.lastOOMessage.option_ids

    if (lastMessageOptionIds.length === 1 && lastMessageOptionIds[0] === GAME_OPTION_ID) {

        profile = await tick(
            config,
            profile,
            incomingMessage.body,
        )
    
        if(profile.lastGame==null){
            throw error(500, "Error: services/state.ts-getResponseMessage last game can't be null but it is.")
        }

        if (profile.lastGame.is_active) {
            const censoredPhrase = censorPhrase(profile.lastGame.phrase, [...profile.lastGame.given, ...profile.lastGame.guesses])
            const guessesCountStr = `${profile.lastGame.guesses.length}/${config.game_guess_count}`
            return {
                body: `${guessesCountStr}\n${censoredPhrase}`,
                options: [
                    {
                        id: GAME_OPTION_ID,
                        body: ""
                    }
                ],
            }
        }

        let endMessage = profile.lastGame.is_won ?
            `Win ${profile.lastGame.phrase}` :
            `Lost ${profile.lastGame.phrase}`


        return {
            body: `${endMessage}\n${optionsToStr(normalOptions)}`,
            options:normalOptions,
        }

    }

    console.log(`Calling tool: ${incomingMessage.optionId}`)
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
    console.log(`Found phrase: ${phrase.content}`) 
    profile = await createGame(
        config,
        profile,
        phrase.content,
        difficulty,
    )

    console.log(`Game created: ${profile.lastGame}`) 
    
    if(profile.lastGame==null){
        throw error(500, "Error: services/state.ts-handleGame last game can't be null but it is.")
    }

    if (!profile.lastGame.is_active) {
        return {
            body: `Not enough credit\n credits:${profile.credit}\nActions:${optionsToStr(normalOptions)}`,
            options:normalOptions
        }
    }

    const censoredPhrase = censorPhrase(profile.lastGame.phrase, [...profile.lastGame.given, ...profile.lastGame.guesses])
    return {
        body: `${config.game_guess_count} times to guess the letters\n1 time to guess the phrase\n${censoredPhrase}`,
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
