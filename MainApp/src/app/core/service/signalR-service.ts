import { Injectable } from '@angular/core';
import * as SignalR from '@aspnet/signalr';
import { environment } from "src/environments/environment";
import { MessageModel } from '../models/chat/message-model';


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