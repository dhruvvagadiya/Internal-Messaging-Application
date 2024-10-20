import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Group } from '../models/Group/group';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class GroupChatService {
    
    groupChanged =new BehaviorSubject<Group>(null);
    
    constructor(private http : HttpClient) {
    }
    
    getRecentGroups() {
        return this.http.get(environment.apiUrl + "/groupchat/recent");
    }

    sendChat(groupId : number, data : FormData) {
        return this.http.post(environment.apiUrl + "/groupchat/" + groupId, data);
    }

    getChatData(){
        return this.http.get(environment.apiUrl + "/groupchat/data");
    }

    getChatOfGroup(groupId : number) {
        return this.http.get(environment.apiUrl + "/groupchat/" + groupId);
    }

    getProfileUrl(url : string){
        if(url) {
            return environment.hostUrl + "/groupchat/" + url
        }
        return "https://w7.pngwing.com/pngs/754/2/png-transparent-samsung-galaxy-a8-a8-user-login-telephone-avatar-pawn-blue-angle-sphere-thumbnail.png";
    }
}