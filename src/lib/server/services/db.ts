import { prisma } from "../clients/prisma";
import { ConfigType, type Message, MessageDir, type Config, type Profile, type MError, Difficulty, type Phrase } from "@prisma/client";
import { redis } from "../clients/redis";
import type { MProfile } from "../../customTypes";
import { error } from "@sveltejs/kit";



// expire redis records after x
const defaultRedisExpiration = 60 * 10



export async function getPhrase(config: Config){
    return await prisma.$queryRaw<Phrase>`SELECT * FROM "Phrase" ORDER BY RANDOM() LIMIT 1;`
}




export async function updateActiveGame(
    config: Config,
    profile: MProfile,
    newGuess:string|undefined,
    isWon:boolean=false,
    isActive:boolean=true,
) {

    const lastActiveGame = profile.games.slice(-1)[0].is_active?profile.games.slice(-1)[0]:null

    if(lastActiveGame==null){
        throw error(500, "Error: services/db.ts Trying to update last active game, but last game is not active.")
    }

    if(newGuess){
        lastActiveGame.guesses.push(newGuess.toLowerCase())
    }

    const game = await prisma.game.update({
        where:{
            id:lastActiveGame.id,
            is_active:true
        },
        data:{
            is_active:isActive,
            is_won:isWon,
            guesses:lastActiveGame.guesses
        }
    })

    profile.games[profile.games.length-1] = game


    if(isWon){
        const tempProfile = await prisma.profile.update({
            where:{id:profile.id},
            data:{points:profile.points+game.points_to_win}
        })
        profile = {
            ...tempProfile,
            games:profile.games,
            messages: profile.messages
        } as MProfile
    }

    redis.set(profile.twilio_id, JSON.stringify(profile), "EX", defaultRedisExpiration)

    return profile

}


export async function createGame(
    config: Config,
    profile: MProfile,
    phrase: string,
    difficulty: Difficulty,
) {
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


    function getRandomCharacters(phrase: string, size: number): string[] {
        const charsArray = Array.from(phrase.toLocaleLowerCase());
        const uniqueCharsArray = [...new Set(charsArray)];
        const shuffledArray = uniqueCharsArray.sort(() => 0.5 - Math.random());
        return shuffledArray.slice(0, size);
    }

    if(profile.credit<creditCost){
        return profile
    }

    const tempProfile = await prisma.profile.update({
        where:{id:profile.id},
        data:{credit:profile.credit-creditCost}
    })
    profile = {
        ...tempProfile,
        games:profile.games,
        messages: profile.messages
    } as MProfile


    const game = await prisma.game.create({
        data: {
            profile_id: profile.id,
            phrase,
            difficulty,
            given:getRandomCharacters(phrase, givenCount),
            points_to_win:pointsToWin,
            credit_cost:creditCost,
        }
    })



    profile.games.push(game)

    redis.set(profile.twilio_id, JSON.stringify(profile), "EX", defaultRedisExpiration)

    return profile
}





export async function getPlayerRank(config:Config, profile:MProfile) {
    const result = await prisma.$queryRaw<{rank:number}|undefined|null>`
      SELECT
        RANK() OVER (ORDER BY points DESC) as rank
      FROM
        "Profile"
      WHERE
        id = ${profile.id}
    `;

    if(result==null || result.rank==null){
        throw error(500, `player rank retrieval failed: result:${result} || result.rank${result?.rank}`)
    }
  
    return result.rank;
  }

export async function getLeaderboard(config:Config){
    return await prisma.profile.findMany({
        take: config.leaderboard_top_count,
        orderBy: {
            points: 'desc',
        },
    })
}




export async function getMErrorByRecent(config: Config, count: number) {
    return await prisma.mError.findMany({
        take: count,
        orderBy: {
            created_at: 'asc',
        },
    })
}

export async function createMError(
    config: Config,
    profile: MProfile,
    content: string,
    extra_json: any | undefined | null = undefined,
) {

    const mError = await prisma.mError.create({
        data: {
            profile_id: profile.id,
            content,
            extra_json,
        }
    })
}


export async function createMessage(
    config: Config,
    profile: MProfile,
    messageDir: MessageDir,
    content: string,
    optionIds:string[],
    extra_json: any | undefined | null = undefined,
    image_urls: string[] = []
) {

    const message = await prisma.message.create({
        data: {
            profile_id: profile.id,
            message_dir: messageDir,
            content,
            option_ids:optionIds,
            extra_json,
            image_urls
        }
    })

    profile.messages.push(message)

    redis.set(profile.twilio_id, JSON.stringify(profile), "EX", defaultRedisExpiration)

    return profile
}


export async function createProfile(config: Config, twilioId: string): Promise<MProfile> {

    const profile = await prisma.profile.create({
        data: {
            twilio_id: twilioId,
        }
    })
    const mPorfile = {
        ...profile,
        games:[],
        messages: []
    } as MProfile

    redis.set(twilioId, JSON.stringify(mPorfile), "EX", defaultRedisExpiration)

    return mPorfile
}


export async function getProfile(config: Config, twilioId: string) {



    let profile: MProfile | null | undefined

    const res = await redis.get(twilioId)

    if (res == null) {
        const profileValue = await prisma.profile.findFirst({
            where: {
                twilio_id: twilioId
            },
            include: {
                games:{
                    where:{is_active:true},
                    take: 1,
                    orderBy: {
                        created_at: 'asc',
                    },
                },
                messages: {
                    where:{
                        message_dir:MessageDir.OUTBOUND,
                        option_ids:{
                            isEmpty:false
                        }
                    },
                    take: 1,
                    orderBy: {
                        created_at: 'asc',
                    },
                }
            }
        })
        if (profileValue) {
            redis.set(twilioId, JSON.stringify(profileValue), "EX", defaultRedisExpiration)
            profile = profileValue
        }
    } else {
        profile = JSON.parse(res)
    }

    return profile
}



export async function getConfig() {

    return await prisma.config.findFirst({ where: { id: ConfigType.FREE } })


    // let config:Config|null|undefined

    // // Fetch and cache 'Config', and save to locals
    // const res = await redis.get(ConfigType.FREE)

    // if (res==null) {
    //     const configValue = await prisma.config.findFirst({ where: { id: ConfigType.FREE } })
    //     if(configValue){
    //         redis.set(ConfigType.FREE, JSON.stringify(configValue))
    //         config = configValue
    //     }
    // } else {
    //     config = JSON.parse(res)
    // }

    // return config
}


export async function createConfig(): Promise<Config> {
    return await prisma.config.create({
        data: {
            id: ConfigType.FREE
        }
    })
}








