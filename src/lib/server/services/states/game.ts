import type { Config, Message, Profile } from "@prisma/client"



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


export async function getGameResponse(config:Config, profile:Profile, incomingMessageStr:string, lastActiveMessage:Message){

    const gameRecord:GameRecord = JSON.parse(lastActiveMessage.extra_json as string) as GameRecord

    // apply user guess

    // change game record

    // win/lose conditions
        // win db game
        // cost credit
        // add points

    // save to db
    // return text
}
