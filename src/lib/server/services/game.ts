import type { Game, Config } from "@prisma/client";
import { updateActiveGame } from "./db";
import type { MProfile } from "$lib/customTypes";
import { error } from "@sveltejs/kit";


export async function tick(config:Config, profile:MProfile, playerInput:string):Promise<MProfile>{
    if(profile.lastGame==null || !profile.lastGame.is_active){
        throw error(500, "Error: services/game.ts Trying to tick last game, but it's not active or it's null.")
    }

    // if player's answer is not a letter take it as a final guess
    if(!isLetter(playerInput)){
        if(profile.lastGame.phrase.toLocaleLowerCase() === playerInput.toLocaleLowerCase()){
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

    profile = await updateActiveGame(
        config,
        profile,
        playerInput.toLocaleLowerCase(),
    )

    // if player guesses all the letters win by default
    // _------ wrong
    if(allCharactersExist(profile.lastGame!.phrase, [...profile.lastGame!.given, ...profile.lastGame!.guesses])){
        return await updateActiveGame(
            config,
            profile,
            undefined,
            true,
            false,
        )
    }

    // If guesses exceed limit
    if(profile.lastGame!.guesses.length > config.game_guess_count){
        return await updateActiveGame(
            config,
            profile,
            undefined,
            false,
            false,
        ) 
    }

    return profile
    
}



function isLetter(str:string) {
    return str.length === 1 && str.match(/[a-z]/i);
}
function allCharactersExist(str: string, characters: string[]): boolean {
    return characters.every(char => str.includes(char));
}