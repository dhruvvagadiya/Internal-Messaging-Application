import { Injectable, OnInit } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { BehaviorSubject } from "rxjs";
import { LoggedInUser } from "../models/user/loggedin-user";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})

export class UserService implements OnInit {

    private userSubject = new BehaviorSubject<LoggedInUser>(null);
    
    constructor(private http: HttpClient, private authService : AuthService) {        
        this.getCurrentUserDetails();
    }

    ngOnInit(): void {
    }

    updateProfile(formData : FormData, username : string) {
        return this.http.put(environment.apiUrl + "/user/" + username, formData);
    }

    updateProfileStatus(status : string){
        return this.http.post(environment.apiUrl + "/user/change/", {}, {params : new HttpParams().append('status', status)});
    }

    // getImage(){
    //     return this.http.get(environment.apiUrl + "/account/getimage", { responseType: 'blob' });
    // }

    getUsers(name : string){
        return this.http.get(environment.apiUrl + "/user/getusers/" + name);
    }

    getAll(){
        return this.http.get(environment.apiUrl + "/user/all");
    }

    getUser(username : string){        
        return this.http.get<LoggedInUser>(environment.apiUrl + "/user/"+ username);
    }

    getCurrentUserDetails() {
        const curuser = this.authService.getLoggedInUserInfo();        
        if(curuser.sub && curuser.exp >= Date.now() / 1000){
            this.getUser(curuser.sub).subscribe(e => { 
                this.userSubject.next(e);
            });
        }
    }

    getUserSubject(){
        return this.userSubject.asObservable();
    }

    getProfileUrl(url : string){
        if(url) {
            return environment.hostUrl + "/images/" + url
        }
        return "https://w7.pngwing.com/pngs/754/2/png-transparent-samsung-galaxy-a8-a8-user-login-telephone-avatar-pawn-blue-angle-sphere-thumbnail.png";
    }
}