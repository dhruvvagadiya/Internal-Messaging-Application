import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AdminProfileDTO } from '../models/user/AdminProfileDTO';

@Injectable({providedIn: 'root'})
export class AdminService {

    constructor(private http : HttpClient) { }
    
    GetAll(){
        return this.http.get(environment.apiUrl + "/admin/all");
    } 

    UpdateEmployee(employee : AdminProfileDTO){
        return this.http.post(environment.apiUrl + "/admin/update", employee);
    }

    DeleteEmployee(username : string){
        return this.http.delete(environment.apiUrl + '/admin/delete', {
            params : new HttpParams().append('userName', username)
        });
    }
}