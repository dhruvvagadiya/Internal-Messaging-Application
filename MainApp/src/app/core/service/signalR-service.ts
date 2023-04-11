import { Injectable } from '@angular/core';
import * as SignalR from '@aspnet/signalr';
import { environment } from "src/environments/environment";
import { MessageModel } from '../models/chat/message-model';


@Injectable({providedIn: 'root'})
export class SignalrService {
    constructor() { }
    
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
                    // console.log(value); conn ID
                })
            })
            .catch(err => {
                console.log('Error while connecting with hub')
            });
    }

    sendMessage(res : MessageModel){
        this.hubConnection.invoke("sendMessage", res)
            .catch(err => console.log(err));
    }

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