import { Injectable } from '@angular/core';
import * as SignalR from '@microsoft/signalr';
import { environment } from "src/environments/environment";
import { GroupChatModel } from '../models/GroupChat/group-message-model';
import { Group } from '../models/Group/group';
import { GroupMember } from '../models/Group/group-member';


@Injectable({providedIn: 'root'})
export class SignalrService {

    constructor() {   
    }
    
    hubConnection : signalR.HubConnection;

    startConnection = (username : string) => {

        //make connection
        this.hubConnection = new SignalR.HubConnectionBuilder()
            .withUrl(environment.hostUrl + 'toastr', {
                skipNegotiation : true,
                transport : SignalR.HttpTransportType.WebSockets   //to avoid cors issues
            })
            .build();
        
        //start connection
        this.hubConnection
            .start()
            .then(() => {
                
                //create and store connection
                this.hubConnection.invoke("saveConnection", username).then(value => {
                })
            })
            .catch(err => {
                console.log('Error while connecting with hub')
            });
    }

    //close connection when user logout
    closeConnection (username : string) {
        if(this.hubConnection){
            this.hubConnection.invoke('closeConnection', username)
            .catch(err => console.log(err));
        }
    }

    // ------------- simple chat ------------------ 

    //mark all msgs seen where msgFrom is sender & msgTo is receiver
    seenMessages(sender : string, receiver : string) {
        this.hubConnection.invoke('seenMessages', sender, receiver);

        //FOR SENDER & RECEIVER UPDATE SEEN CNT
        this.hubConnection.invoke('GetRecentChat', receiver, sender);  //because params are ultaaaa
    }

    // -------------- for group chat ---------------

    sendGroupMessage(res : GroupChatModel, name : string){
        //SEND MSG TO GROUP
        this.hubConnection.invoke("sendGroupMessage", res, name)
            .catch(err => console.log(err));        
    }

    updateRecentGroup(group : Group, chat : GroupChatModel){
        this.hubConnection.invoke("updateRecentGroup", group ,chat)
            .catch(err => console.log(err));
    }

    updateGroup(obj : Group){
        this.hubConnection.invoke("updateGroup", obj)
        .catch(err => console.log(err));
    }

    addMembers(userNames: string [], group : Group){
        this.hubConnection.invoke("addMembers", userNames , group)
        .catch(err => console.log(err));
    }

    leaveFromGroup(groupId : number, username : string, removed : boolean, groupName? : string){
        this.hubConnection.invoke("leaveFromGroup", groupId , username, removed, groupName)
        .catch(err => console.log(err));
    }

    updateMemberList(groupId : number, newMembers : GroupMember[]){
        this.hubConnection.invoke("UpdateMemberList", groupId , newMembers)
        .catch(err => console.log(err));
    }


    // --------- for profile status ---------
    updateProfileStatus(status : string, username : string){
        this.hubConnection.invoke("UpdateProfileStatus", status , username)
        .catch(err => console.log(err));
    }  
}