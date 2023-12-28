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
                publicTwilioId: hideCharacters(p.twilio_id)
            }
        })
    }
};

function hideCharacters(input: string): string {
    if (input.length <= 2) {
        return input;
    }
    const maskedSection = "*".repeat(input.length - 2);
    const visibleSection = input.slice(-2);
    return maskedSection + visibleSection;
}