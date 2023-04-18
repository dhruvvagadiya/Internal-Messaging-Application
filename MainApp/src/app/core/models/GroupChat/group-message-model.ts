export interface GroupChatModel {
    id : number,
    groupId : number,
    messageFrom : string,
    firstName : string,
    lastName : string,
    imageUrl : string,

    type : string,
    content : string,
    filePath? : string,
    createdAt : Date,
    updatedAt : Date,
    
    repliedTo? : string,
}