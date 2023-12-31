import { prisma } from "../clients/prisma";
import { ConfigType, type Message, MessageDir, type Config, type Profile, type MError, Difficulty, type Phrase, MessageType, CreditTransferReason } from "@prisma/client";
import { redis } from "../clients/redis";
import { error } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { NODE_ENV } from "$env/static/private";



// expire redis records after x
const defaultRedisExpiration = 60 * 10

export async function createGameAndCreditTransferAndUpdateProfile(
    config:Config, 
    profile:Profile, 
    gameRecord:GameRecord,
    isWon:boolean,
    gameConfig:GameConfig
    ){
    
    createGame(
        config,
        profile,
        gameRecord.phrase,
        gameRecord.difficulty as Difficulty,
        isWon,
        gameRecord.givenChars,
        gameRecord.guessedChars,
        gameConfig.pointsToWin,
        gameConfig.creditCost,
    )

    createCreditTransfer(config, profile, -gameConfig.creditCost, CreditTransferReason.NEW_GAME)

    return await updateProfile(
        config,
        profile,
        profile.credit - gameConfig.creditCost,
        isWon? profile.points+gameConfig.pointsToWin : profile.points
    )
}
export async function createCreditTransferAndUpdateProfile(config:Config, profile:Profile, amount:number, reason:CreditTransferReason){
    createCreditTransfer(config, profile, amount, reason)
    return await updateProfile(
        config,
        profile,
        profile.credit + amount,
        profile.points
    )
}

export async function createCreditTransfer(config:Config, profile:Profile, amount:number, reason:CreditTransferReason){
    return await prisma.creditTransfer.create({
        data:{
            profile_id:profile.id,
            credit_count:amount,
            reason:reason
        }
    })
}



export async function createPurchaseSession(purchaseSessionData:PurchaseSession):Promise<string|null>{
    const sessionCode = `psc:${randomUUID()}` 
    redis.set(sessionCode, JSON.stringify(purchaseSessionData))
    return sessionCode
}

export async function getPurchaseSession(sessionCode:string|null|undefined):Promise<PurchaseSession|null>{
    if(sessionCode==null) return null

    const res = await redis.get(sessionCode)
    if(res==null){
        return null
    }
    return JSON.parse(res)
}



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
        throw error(500, `Error: db.ts-getPhrase phrase is null. randId:${randId} phraseCount:${phraseCount}`)
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
            extra_json:extraJson?JSON.stringify(extraJson):undefined,
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

export async function getProfileById(config: Config, profileId: string){
    return await prisma.profile.findFirst({
        where: {
            id: profileId
        }
    })
}
export async function getProfileByTwilioId(config: Config, twilioId: string) {
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





// =============== ONLY IN DEVELOPMENT =============
export async function getLastMessages(config: Config, profile:Profile, count:number) {
    if(NODE_ENV!=="development"){
        throw error(403)
    }

    return await prisma.message.findMany({
        where: {
            profile_id:profile.id,
        },
        take:-count,
        orderBy: {
            created_at: 'asc',
        },
    })
}
export async function deleteProfile(config: Config, profileId:string) {
    if(NODE_ENV!=="development"){
        throw error(403)
    }

    return await prisma.profile.delete({
        where: {
            id:profileId,
        },
    })
}




