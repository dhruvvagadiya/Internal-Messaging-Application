import { Injectable, OnInit } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { BehaviorSubject } from "rxjs";
import { LoggedInUser } from "../models/loggedin-user";
import { AuthService } from "./auth-service";

@Injectable({
    providedIn: 'root'
})

export class UserService implements OnInit {

    user = new BehaviorSubject<LoggedInUser>(null);

    constructor(private http: HttpClient, private authService : AuthService) {
        this.getCurrentUserDetails();
    }

    ngOnInit(): void {
    }

    updateProfile(formData : FormData, username : string) {
        return this.http.put(environment.apiUrl + "/user/" + username, formData);
    }

    // getImage(){
    //     return this.http.get(environment.apiUrl + "/account/getimage", { responseType: 'blob' });
    // }

    getUsers(name : string){
        return this.http.get(environment.apiUrl + "/user/getusers/" + name);
    }

    getUser(username : string){
        return this.http.get<LoggedInUser>(environment.apiUrl + "/user/"+ username);
    }

    getLoggedInUser() {
        const curuser = this.authService.getLoggedInUserInfo();
        return this.getUser(curuser.sub);
    }

    getCurrentUserDetails() {
        const curuser = this.authService.getLoggedInUserInfo();
        this.getLoggedInUser().subscribe(e => { 
            this.user.next(e);
        });
    }

    getProfileUrl(user : LoggedInUser){
        if(user && user.imageUrl) {
            return environment.hostUrl + "/images/" + user.imageUrl
        }
        return "https://via.placeholder.com/80x80";
    }
}