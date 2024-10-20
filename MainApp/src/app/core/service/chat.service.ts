import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class ChatService {
    
    constructor(private http : HttpClient) { }
    
    getRecentUsers() {
        return this.http.get(environment.apiUrl + "/chat/recent");
    }

    sendChat(data : FormData) {
        return this.http.post(environment.apiUrl + "/chat", data);
    }

    getChatWithUser(username : string) {
        return this.http.get(environment.apiUrl + "/chat", {params : new HttpParams().append('toUser', username)});
    }

    getChatData(){
        return this.http.get(environment.apiUrl + "/chat/data");
    }
}