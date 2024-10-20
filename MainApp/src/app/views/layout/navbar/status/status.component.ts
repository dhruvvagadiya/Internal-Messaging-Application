import { Component, OnInit } from '@angular/core';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { SignalrService } from 'src/app/core/service/signalR.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
    selector: 'app-status-component',
    templateUrl: 'status.component.html',
    styleUrls : ['status.component.scss']
})

export class StatusComponent implements OnInit {

    user: LoggedInUser;

    constructor(private userService : UserService, private signalrService : SignalrService) { }

    ngOnInit() {
        this.userService.getUserSubject().subscribe(e => {
            this.user = e;
        });
    }


    updateStatus(status : string){

        this.userService.updateProfileStatus(status).subscribe(
            (e : {status : string}) => {
                this.user.profileStatus = e.status;
                this.signalrService.updateProfileStatus(status, this.user.userName);
            }
        )
    }
}