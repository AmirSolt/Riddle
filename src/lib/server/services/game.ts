import type { Game, Config } from "@prisma/client";
import { updateActiveGame } from "./db";
import type { MProfile } from "$lib/customTypes";


export async function tick(config:Config, profile:MProfile, playerInput:string):Promise<MProfile>{
    const lastGame = profile.games.slice(-1)[0]

    if(!isLetter(playerInput)){
        // final guess
        if(lastGame.phrase.toLocaleLowerCase() === playerInput.toLocaleLowerCase()){
            return await updateActiveGame(
                config,
                profile,
                undefined,
                true,
                false,
            )
        }
        return await updateActiveGame(
            config,
            profile,
            undefined,
            false,
            false,
        ) 
    }

    return await updateActiveGame(
        config,
        profile,
        playerInput.toLocaleLowerCase(),
    )
}



function isLetter(str:string) {
    return str.length === 1 && str.match(/[a-z]/i);
}