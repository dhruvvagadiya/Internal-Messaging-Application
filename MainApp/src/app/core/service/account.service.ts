import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    googleLogin(token : string){
        var temp = new HttpHeaders();
        temp = temp.append('gtoken', token);

        return this.http.post(environment.apiUrl + "/account/googleLogin", {}, {
            headers : temp
        });
    }

    changePassword(data : {currentPassword : string, password : string}) {
        return this.http.post(environment.apiUrl + "/account/changePassword", data);
    }

    getDesignations(){
        return this.http.get(environment.apiUrl + "/designation/getall");
    }

}
