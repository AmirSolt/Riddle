import { error } from "@sveltejs/kit"
import { Difficulty, MessageDir, MessageType, type Config, type Profile } from "@prisma/client"
import { createMessage, createPurchaseSession, getPhrase } from "../db"
import { DOMAIN } from "$env/static/private"



export function getGameConfig(config:Config, difficulty:Difficulty){
    let givenCount: number|undefined
    let pointsToWin: number|undefined
    let creditCost: number|undefined
    switch (difficulty) {
        case Difficulty.EASY:
            givenCount = config.easy_game_given_count
            pointsToWin = config.easy_points_to_win
            creditCost = config.easy_credit_cost
            break;
        case Difficulty.MEDIUM:
            givenCount = config.medium_game_given_count
            pointsToWin = config.medium_points_to_win
            creditCost = config.medium_credit_cost
            break;
        case Difficulty.HARD:
            givenCount = config.hard_game_given_count
            pointsToWin = config.hard_points_to_win
            creditCost = config.hard_credit_cost
            break;
        default:
            throw error(500, `Difficulty is unkown. difficulty:${difficulty}`)
    }

    return {
        givenCount,
        pointsToWin,
        creditCost,
    }
}

export function getRandomCharactersFromPhrase(phrase: string, size: number): string[] {
    const charsArray = Array.from(phrase.toLocaleLowerCase());
    const uniqueCharsArray = [...new Set(charsArray)];
    const shuffledArray = uniqueCharsArray.sort(() => 0.5 - Math.random());
    return shuffledArray.slice(0, size);
}

export function censorPhrase(phrase: string, revealChars: string[]): string {
    revealChars = revealChars.map(ch => ch.toLowerCase())
    const safeChars = revealChars.join('').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regexPattern = new RegExp(`[^ ${safeChars}]`, 'g');

    return phrase.toLowerCase().replace(regexPattern, '-');
}





// ============================================




export function getNormalOptions(config:Config, profile:Profile){
    return [
        {
            id: "start",
            body: tools.start.getBody(config, profile),
        },
        {
            id: "store",
            body: tools.store.getBody(config, profile),
        },
        {
            id: "lead",
            body: tools.lead.getBody(config, profile),
        },
    ]
}

export function optionsToStr(options:MenuOption[]){
    return options.map(opt => `${opt.id}: ${opt.body}`).join("\n")
}

export const tools: { [key: string]: Tool } = {

    start: {
        getBody: (config:Config, profile:Profile)=>{
            return ""
        },
        getResponse: async (config: Config, profile: Profile) => {
            const options:MenuOption[] = [
                {
                    id: "easy",
                    body: tools.easy.getBody(config, profile),
                },
                {
                    id: "medium",
                    body: tools.medium.getBody(config, profile),
                },
                {
                    id: "hard",
                    body: tools.hard.getBody(config, profile),
                },
            ]
            const message = await createMessage(
                config,
                profile,
                MessageDir.OUTBOUND,
                `Choose a difficulty: \n${optionsToStr(options)}`,
                true,
                MessageType.MENU,
                options
            )
        
            return message.content
        }
    },
    store: {
        getBody: (config:Config, profile:Profile)=>{

            return ""
        },
        getResponse: async (config: Config, profile: Profile) => {
            const purchaseSessionCode = createPurchaseSession({profileId:profile.id})
            const storeLink = `${DOMAIN}/payment/store?psc=${purchaseSessionCode}`
            const options = getNormalOptions(config, profile)
            const message = await createMessage(
                config,
                profile,
                MessageDir.OUTBOUND,
                `Store:${storeLink} \n${optionsToStr(options)}`,
                true,
                MessageType.MENU,
                options
            )
        
            return message.content
        }
    },
    lead: {
        getBody: (config:Config, profile:Profile)=>{
            return ""
        },
        getResponse: async (config: Config, profile: Profile) => {

            return ""
        }
    },
    easy: {
        getBody: (config:Config, profile:Profile)=>{
            return ""
        },
        getResponse: async (config: Config, profile: Profile) => {
            return await handleGame(config, profile, Difficulty.EASY)
        }
    },
    medium: {
        getBody: (config:Config, profile:Profile)=>{
            return ""
        },
        getResponse: async (config: Config, profile: Profile) => {
            return await handleGame(config, profile, Difficulty.MEDIUM)
        }
    },
    hard: {
        getBody: (config:Config, profile:Profile)=>{
            return ""
        },
        getResponse: async (config: Config, profile: Profile) => {
            return await handleGame(config, profile, Difficulty.HARD)
        }
    },
}

interface Tool {
    getBody: (config: Config, profile: Profile) => string
    getResponse: (config: Config, profile: Profile) => Promise<string|null>
}



export async function handleGame(config:Config, profile:Profile, difficulty:Difficulty):Promise<string|null>{
    const phrase = await getPhrase(config)
    console.log(`Found phrase: ${phrase.content}`) 

    const gameConfig = getGameConfig(config, difficulty)

    if(profile.credit < gameConfig.creditCost){
        const storeOption = [
            {
                id: "store",
                body: tools.store.getBody(config, profile),
            },
        ]
        const message = await createMessage(
            config,
            profile,
            MessageDir.OUTBOUND,
            `Don't have enough credit to start a game.\n${optionsToStr(storeOption)}`,
            true,
            MessageType.MENU,
            storeOption
        )

        return message.content
    }

    const givenChars = getRandomCharactersFromPhrase(phrase.content, gameConfig.givenCount)
    const censoredPhrase = censorPhrase(phrase.content, [...givenChars])

    const message = await createMessage(
        config,
        profile,
        MessageDir.OUTBOUND,
        `Guess the letter ${config.game_guess_count} times or guess the phrase once.\n${censoredPhrase}`,
        true,
        MessageType.GAME,
        {
            difficulty: difficulty,
            phrase: phrase.content,
            givenChars: givenChars,
            guessedChars: [],
        } as GameRecord
    )

    return message.content
}

