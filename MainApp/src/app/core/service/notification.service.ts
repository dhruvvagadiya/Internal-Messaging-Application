import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Notification } from '../models/notification/notification';

@Injectable({providedIn: 'root'})
export class NotificationService {
    
    constructor(private http : HttpClient) { }
    
    public GetNotifications(userName : string){
        return this.http.get(environment.apiUrl + '/notification/' + userName);
    }

    public AddNotification(data : Notification){
        return this.http.post(environment.apiUrl + '/notification', data);
    }

    public ViewAll(userName : string){
        return this.http.get(environment.apiUrl + '/notification/view/' + userName);
    }

    public MarkAsSeen(id : number){
        return this.http.get(environment.apiUrl + '/notification/seen/' + id);
    }

    public ClearAll(userName : string){
        return this.http.get(environment.apiUrl + '/notification/clear/' + userName);
    }
}