import { Group } from "../Group/group";

export interface GroupRecentChatModel {
    group : Group,
    lastMsgTime? : Date,
    lastMessage? : string,

    //sender
    firstName : string,
    lastName : string,
    imageUrl? : string
}