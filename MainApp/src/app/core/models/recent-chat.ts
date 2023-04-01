import { LoggedInUser } from "./loggedin-user"

export interface RecentChatModel {
    lastMsgTime? : Date,
    lastMessage : string,
    user : LoggedInUser
}