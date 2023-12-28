import { MessageDir, type Config, type Difficulty, type Message, type Profile, MessageType } from "@prisma/client"
import { createGame, createMessage, updateProfile } from "../db"
import { censorPhrase, getGameConfig, getNormalOptions, optionsToStr } from "./helper"



export async function getGameResponse(config: Config, profile: Profile, incomingMessageStr: string, lastActiveMessage: Message) {

    const gameRecord: GameRecord = JSON.parse(lastActiveMessage.extra_json as string) as GameRecord

    let isOver = false
    let isWon = false
    
    if (!isLetter(incomingMessageStr)) {
        isOver = true
        isWon = gameRecord.phrase.toLocaleLowerCase() === incomingMessageStr.toLocaleLowerCase()
    }else{

        gameRecord.guessedChars.push(incomingMessageStr.toLocaleLowerCase())

        if(allCharactersExist(gameRecord.phrase.toLocaleLowerCase(), [...gameRecord.givenChars, ...gameRecord.guessedChars])) {
            isOver = true
            isWon = true
        }else{
            if(gameRecord.guessedChars.length >= config.game_guess_count){
                isOver = true
                isWon = false
            }
        }
    }

    if(isOver){
        const gameConfig = getGameConfig(config, gameRecord.difficulty as Difficulty)

        await createGame(
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

        profile = await updateProfile(
            config,
            profile,
            profile.credit - gameConfig.creditCost,
            isWon? profile.points+gameConfig.pointsToWin : profile.points
        )

        const winContent = isWon? `You have won ${gameConfig.pointsToWin}.` : "You lost."
        const message = await createMessage(
            config,
            profile,
            MessageDir.OUTBOUND,
            `${winContent}\n${optionsToStr(getNormalOptions(config, profile))}`,
            true,
            MessageType.MENU,
            getNormalOptions(config, profile)
        )

        return message.content

    }


    const censoredPhrase = censorPhrase(gameRecord.phrase, [...gameRecord.givenChars, ...gameRecord.guessedChars])
    const message = await createMessage(
        config,
        profile,
        MessageDir.OUTBOUND,
        `${gameRecord.guessedChars.length}/${config.game_guess_count}\n${censoredPhrase}`,
        true,
        MessageType.GAME,
        gameRecord
    )

    return message.content
}


function isLetter(str: string) {
    return str.length === 1 && str.match(/[a-z]/i);
}
function allCharactersExist(input: string, letters: string[]): boolean {
    const inputSet = new Set(input.split(''));
    for (const char of inputSet) {
      if (!letters.includes(char)) {
        return false;
      }
    }
    return true;
  }
  