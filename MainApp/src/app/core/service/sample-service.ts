import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SampleService {
    constructor(private http: HttpClient) { }
    runSampleAPI() {
        return this.http.get(environment.apiUrl + "/Sample/");
    }
}
