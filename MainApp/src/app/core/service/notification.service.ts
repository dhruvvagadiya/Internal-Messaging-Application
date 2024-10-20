import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Notification } from '../models/notification/notification';

@Injectable({providedIn: 'root'})
export class NotificationService {
    
    constructor(private http : HttpClient) { }
    
    public GetNotifications(){
        return this.http.get(environment.apiUrl + '/notification');
    }

    public AddNotification(data : Notification){
        return this.http.post(environment.apiUrl + '/notification', data);
    }

    public ViewAll(){
        return this.http.get(environment.apiUrl + '/notification/view');
    }

    public MarkAsSeen(id : number){
        return this.http.get(environment.apiUrl + '/notification/seen/' + id);
    }

    public ClearAll(){
        return this.http.get(environment.apiUrl + '/notification/clear');
    }
}