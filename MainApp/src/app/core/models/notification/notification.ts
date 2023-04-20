export interface Notification
{
    id : number,
    userName : string,
    content : string,
    type : string,
    createdAt? : Date
    isSeen? : number
}
    