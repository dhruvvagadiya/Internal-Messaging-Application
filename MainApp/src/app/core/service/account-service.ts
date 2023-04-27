import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { RegistrationModel } from "../models/user/registration-model";
import { LoginModel } from "../models/user/login-model";

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    constructor(private http: HttpClient) { }

    register(registerModel: RegistrationModel) {
        return this.http.post(environment.apiUrl + "/account/register", registerModel);
    }

    login(loginModel: LoginModel) {
        loginModel.userName = loginModel.emailAddress;
        return this.http.post(environment.apiUrl + "/account/login", loginModel);
    }

    changePassword(data : {currentPassword : string, password : string}) {
        return this.http.post(environment.apiUrl + "/account/changePassword", data);
    }

    logout(){
        return this.http.get(environment.apiUrl + "/account/logout");
    }

    getDesignations(){
        return this.http.get(environment.apiUrl + "/designation/getall");
    }
    
}
