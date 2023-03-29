import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { RegistrationModel } from "../models/registration-model";
import { LoginModel } from "../models/login-model";
import { Subject } from "rxjs";

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

    updateProfile(formData : FormData) {
        return this.http.post(environment.apiUrl + "/account/updateprofile", formData);
    }

    getImage(){
        return this.http.get(environment.apiUrl + "/account/getimage", { responseType: 'blob' });
    }
}
