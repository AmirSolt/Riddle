import { prisma } from "../clients/prisma";
import { ConfigType, type Message, MessageDir, type Config, type Profile, type MError, Difficulty, type Phrase, MessageType } from "@prisma/client";
import { redis } from "../clients/redis";
import { error } from "@sveltejs/kit";



// expire redis records after x
const defaultRedisExpiration = 60 * 10



export async function getPhrase(config: Config){
    const rediskey = "Phrase_count"
    let phraseCount:number|undefined
    const res = await redis.get(rediskey)
    if(res==null){
        phraseCount = await prisma.phrase.count()
        redis.set(rediskey, JSON.stringify(phraseCount))
    }else{
        phraseCount = JSON.parse(res)
    }
    if(phraseCount==null){
        throw error(500, "Error: db.ts-getPhrase phrase_count is null.")
    }

    const randId = Math.floor(Math.random() * phraseCount) + 1;
    const phrase = await prisma.phrase.findFirst({
        where:{id:randId}
    })

    if(phrase==null || phrase.content==null){
        throw error(500, "Error: db.ts-getPhrase phrase is null.")
    }

    return phrase
}



export async function createGame(
    config: Config,
    profile: Profile,
    phrase: string,
    difficulty: Difficulty,
    isWon:boolean,
    givenChars:string[],
    guessedChars:string[],
    pointsToWin:number,
    creditCost:number,
) {


    return await prisma.game.create({
        data: {
            profile_id: profile.id,
            phrase,
            difficulty,
            is_won:isWon,
            given_chars:givenChars,
            guessed_chars:guessedChars,
            points_to_win:pointsToWin,
            credit_cost:creditCost,
        }
    })

}



export async function getPlayerRank(config:Config, profile:Profile) {
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
    profile: Profile,
    content: string,
    extra_json: any | undefined | null = undefined,
) {

    return await prisma.mError.create({
        data: {
            profile_id: profile.id,
            content,
            extra_json,
        }
    })
}



export async function getLastActiveMessage(config: Config, profile:Profile) {
    return await prisma.message.findFirst({
        where: {
            profile_id:profile.id,
            is_active: true
        },
        orderBy: {
            created_at: 'desc',
        },
    })
}

export async function createMessage(
    config: Config,
    profile: Profile,
    messageDir: MessageDir,
    content: string,
    isActive:boolean,
    messageType: MessageType,
    extraJson: any | undefined | null = undefined,
    image_urls: string[] = []
) {
    return await prisma.message.create({
        data: {
            profile_id: profile.id,
            message_dir: messageDir,
            content,
            is_active:isActive,
            extra_json:extraJson,
            message_type:messageType,
            image_urls
        }
    })
}

export async function updateProfile(
    config: Config,
    profile: Profile,
    credit:number,
    points:number,
    ): Promise<Profile> {
    return await prisma.profile.update({
        where:{id:profile.id},
        data: {
            credit,
            points
        }
    })
}

export async function createProfile(config: Config, twilioId: string): Promise<Profile> {
    return await prisma.profile.create({
        data: {
            twilio_id: twilioId,
        }
    })
}

export async function getProfile(config: Config, twilioId: string) {
    return await prisma.profile.findFirst({
        where: {
            twilio_id: twilioId
        }
    })
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








