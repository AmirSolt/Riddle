const normalOptions = [
    {
        id:"start",
        body:tools.start.description
    },
    {
        id:"store",
        body:tools.store.description
    },
    {
        id:"lead",
        body:tools.lead.description
    },
]

function optionsToStr(options:Option[]){
    return options.map(opt => `${opt.id}: ${opt.body}`).join("\n")
}



function censorPhrase(phrase: string, revealChars: string[]): string {
    revealChars = revealChars.map(ch => ch.toLowerCase())
    const safeChars = revealChars.join('').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regexPattern = new RegExp(`[^ ${safeChars}]`, 'g');

    return phrase.toLowerCase().replace(regexPattern, '-');
}
