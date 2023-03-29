import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { JwtHelper } from "../helper/jwt-helper";
import { LoggedInUser } from "../models/loggedin-user";

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnInit {
    constructor(private jwtHelper: JwtHelper) {}

    user = new BehaviorSubject<LoggedInUser>(null);

    ngOnInit() : void {
        let token = localStorage.getItem('USERTOKEN');
        this.user = this.jwtHelper.decodeToken(token);
    }

    login(token, callback) {
        localStorage.setItem('isLoggedin', 'true');
        localStorage.setItem('USERTOKEN', token);
        if (callback) {
            this.user.next(this.getLoggedInUserInfo());
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
        return user;
    }

    getUserToken() {
        return localStorage.getItem('USERTOKEN');
    }
}
