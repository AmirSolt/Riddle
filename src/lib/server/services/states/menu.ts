import type { Config, Message, Profile } from "@prisma/client"
import { tools } from "./helper"


export async function getMenuResponse(config:Config, profile:Profile, incomingMessageStr:string, lastActiveMessage:Message):Promise<string|null>{

    const menuOptions:MenuOption[] = JSON.parse(lastActiveMessage.extra_json as string) as MenuOption[]

    const chosenMenuOption = menuOptions.find(menuOption => menuOption.id.toLowerCase() === incomingMessageStr.toLowerCase())
    if (chosenMenuOption == null) {
        return null
    }

    return await tools[chosenMenuOption.id].getResponse(config, profile)
}












