import { getLeaderboard } from "$lib/server/services/db";
import type { Config } from "@prisma/client";

export const load = async ({locals}) => {
    const config:Config = locals.config

    const profiles = await getLeaderboard(config)

    return {
        publicProfiles:profiles.map((p, i)=>{
            return {
                rank:i+1,
                points:p.points,
                publicTwilioId: `******${p.twilio_id.slice(-1)[0]}`
            }
        })
    }
};


