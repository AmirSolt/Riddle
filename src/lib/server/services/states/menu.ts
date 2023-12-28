import type { Config, Message, Profile } from "@prisma/client"
import { tools } from "./helper"


export async function getMenuResponse(config:Config, profile:Profile, incomingMessageStr:string, lastActiveMessage:Message):Promise<string|null>{

    const menuOptions:MenuOption[] = JSON.parse(lastActiveMessage.extra_json as string) as MenuOption[]

    console.log("menuOptions",menuOptions)
    const chosenMenuOption = menuOptions.find(menuOption => menuOption.id.toLowerCase() === incomingMessageStr.toLowerCase())
    if (chosenMenuOption == null) {
        console.log("incoming message did not match options")
        return null
    }
    console.log("chosenMenuOption",chosenMenuOption)

    return await tools[chosenMenuOption.id].getResponse(config, profile)
}












