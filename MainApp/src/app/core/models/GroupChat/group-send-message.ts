export interface GroupSendMessage {
    sender : string,
    groupId : string,
    type : string,
    content : string,
    repliedTo? : number
}