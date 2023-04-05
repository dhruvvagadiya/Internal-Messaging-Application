export interface SendMessage {
    sender : string,
    receiver : string,
    type : string,
    content : string,
    repliedTo? : number
}