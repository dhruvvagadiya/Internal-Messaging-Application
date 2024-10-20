import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AddUser } from '../models/Group/add-user';
import { LoggedInUser } from '../models/user/loggedin-user';

@Injectable({providedIn: 'root'})
export class GroupService {
        
    constructor(private http : HttpClient) {
    }
    
    createGroup(data : FormData) {
        return this.http.post(environment.apiUrl + "/group", data);
    }

    updateGroup(data : FormData) {
        return this.http.put(environment.apiUrl + "/group", data);
    }

    addMembers(selectedUsers : LoggedInUser[], groupId : number){
        return this.http.post(environment.apiUrl + "/group/add", selectedUsers, {params : new HttpParams().append('groupId', groupId)});
    }

    removeMember(userName : string, groupId : number){
        return this.http.post(environment.apiUrl + "/group/remove", {userName, groupId});
    }

    leaveFromGroup(data : AddUser){
        return this.http.post(environment.apiUrl + "/group/remove", data);
    }

    getMembers(groupId : number){
        return this.http.get(environment.apiUrl + "/group/" + groupId);
    }
}