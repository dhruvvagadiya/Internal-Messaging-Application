export interface MessageModel {
    content : string,
    filePath? : string,
    createdAt : Date,
    id : number,
    messageFrom : string,
    messageTo : string,
    type : string,
    repliedTo? : string,
    seenByReceiver : number,
}