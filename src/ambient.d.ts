


interface MenuOption{
    id:string
    body:string
}

interface GameRecord{
    difficulty:string
    phrase:string
    givenChars:string[]
    guessedChars:string[]
}

interface GameConfig{
    givenCount:number
    pointsToWin:number
    creditCost:number
}

interface PurchaseSession{
    profileId:string
}
