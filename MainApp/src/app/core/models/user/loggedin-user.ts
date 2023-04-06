export interface LoggedInUser
{
    firstName?: string,
    lastName?: string,
    email?:string,
    userName?: string
    imageUrl? : string,
    profileType? : number,
    createdAt? : Date,
    createdBy? : number,
    lastUpdatedAt? : Date,
    lastUpdatedBy? : number,
    lastSeen? : Date, 
    sub : string
}
    