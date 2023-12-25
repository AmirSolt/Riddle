



interface IncomingMessage{
    body:string
    optionId:Option.id
}



interface ResponseMessage{
    body:string
    options:Option[]
}

interface Option{
    id:string
    body:string
}