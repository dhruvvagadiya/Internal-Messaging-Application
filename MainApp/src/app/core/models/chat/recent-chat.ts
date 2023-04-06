import { LoggedInUser } from "../user/loggedin-user"

export interface RecentChatModel {
    lastMsgTime? : Date,
    unseenCount : number
    lastMessage : string,
    user : LoggedInUser
}