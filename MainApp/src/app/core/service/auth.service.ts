import { Injectable, OnInit } from "@angular/core";
import { JwtHelper } from "../helper/jwt-helper";
import { LoggedInUser } from "../models/user/loggedin-user";
import { UserService } from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnInit {
    constructor(private jwtHelper: JwtHelper) {}

    ngOnInit() : void {
    }

    login(token, callback) {
        localStorage.setItem('isLoggedin', 'true');
        localStorage.setItem('USERTOKEN', token);
        if (callback) {
            callback();
        }
        
    }
    logout(callback) {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('USERTOKEN');
        if (callback) {
            callback();
        }
    }

    getLoggedInUserInfo() {
        let token = localStorage.getItem('USERTOKEN');
        var user: LoggedInUser = this.jwtHelper.decodeToken(token);
        if(user) user.userName = user.sub;
        return user;
    }

    getUserToken() {
        return localStorage.getItem('USERTOKEN');
    }
}
