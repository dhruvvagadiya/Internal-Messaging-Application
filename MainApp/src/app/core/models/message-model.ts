export interface MessageModel {
    content : string,
    createdAt : Date,
    updatedAt : Date,
    id : number,
    messageFrom : string,
    messageTo : string,
    type : string
}