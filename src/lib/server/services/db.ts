import { prisma } from "../clients/prisma";
import { ConfigType, type Message, MessageDir, type Config, type Profile, type MError } from "@prisma/client";
import { redis } from "../clients/redis";
import type { MProfile } from "../../customTypes";
import { error } from "@sveltejs/kit";



// expire redis records after x
const defaultRedisExpiration = 60 * 10







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
                messages: {
                    where:{message_dir:MessageDir.OUTBOUND},
                    take: config.load_message_to_client_count,
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








