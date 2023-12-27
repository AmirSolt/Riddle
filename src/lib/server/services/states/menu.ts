import type { Config, Message, Profile } from "@prisma/client"

export async function getMenuResponse(config:Config, profile:Profile, incomingMessageStr:string, lastActiveMessage:Message){

    const menuOptions:MenuOption[] = JSON.parse(lastActiveMessage.extra_json as string) as MenuOption[]

    const chosenMenuOption = menuOptions.find(menuOption => menuOption.id.toLowerCase() === incomingMessageStr.toLowerCase())
    if (chosenMenuOption == null) {
        return null
    }

    // call menu
    // get new options
    // save to db
    // return text
}








const tools: { [key: string]: Tool } = {

    start: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            const options = [
                {
                    id: "easy",
                    body: tools.easy.description,
                },
                {
                    id: "medium",
                    body: tools.medium.description,
                },
                {
                    id: "hard",
                    body: tools.hard.description,
                },
            ]
            return {
                body: `Choose a difficulty: \n${optionsToStr(options)}`,
                options,
            }
        }
    },
    store: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {

            return {
                body: "",
                options: [],
            }
        }
    },
    lead: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {

            return {
                body: "",
                options: [],
            }
        }
    },
    easy: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            return await handleGame(config, profile, Difficulty.EASY)
        }
    },
    medium: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            return await handleGame(config, profile, Difficulty.MEDIUM)
        }
    },
    hard: {
        description: "",
        func: async (config: Config, profile: MProfile): Promise<ResponseMessage> => {
            return await handleGame(config, profile, Difficulty.HARD)
        }
    },
}


interface Tool {
    description: string
    func: (config: Config, profile: MProfile) => Promise<ResponseMessage>
}
