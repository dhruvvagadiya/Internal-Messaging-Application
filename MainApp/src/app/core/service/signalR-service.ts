import { Injectable } from '@angular/core';
import * as SignalR from '@aspnet/signalr';
import { environment } from "src/environments/environment";
import { MessageModel } from '../models/chat/message-model';
import { GroupChatModel } from '../models/GroupChat/group-message-model';
import { Group } from '../models/GroupChat/group';


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
                console.log("Hub Connection Successful");

                //create and store connection
                this.hubConnection.invoke("saveConnection", username).then(value => {
                    // console.log(value);  //conn ID
                })
            })
            .catch(err => {
                console.log('Error while connecting with hub')
            });
    }

    //when user sends msg to receiver
    sendMessage(res : MessageModel){
        this.hubConnection.invoke("sendMessage", res)
            .catch(err => console.log(err));
        
        //FOR SENDER ADD RECEIVER TO RECENT CHAT
        //FOR RECEIVER ADD SENDER TO RECENT CHAT
        this.hubConnection.invoke('GetRecentChat', res.messageFrom, res.messageTo);
    }

    sendGroupMessage(res : GroupChatModel){
        //SEND MSG TO GROUP
        this.hubConnection.invoke("sendGroupMessage", res)
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

    leaveFromGroup(groupId : number, username : string){
        this.hubConnection.invoke("leaveFromGroup", groupId , username)
        .catch(err => console.log(err));
    }

    //mark all msgs seen where msgFrom is sender & msgTo is receiver
    seenMessages(sender : string, receiver : string) {
        this.hubConnection.invoke('seenMessages', sender, receiver);

        //FOR SENDER & RECEIVER UPDATE SEEN CNT
        this.hubConnection.invoke('GetRecentChat', receiver, sender);  //because params are ultaaaa
    }

    //close connection when user logout
    closeConnection (username : string) {
        if(this.hubConnection){
            this.hubConnection.invoke('closeConnection', username)
            .catch(err => console.log(err));
        }
    }

    // askServerListener() {
    //     this.hubConnection.on("askServerResponse", (res)=> {
    //         console.log(res);
    //     })
    // }
}