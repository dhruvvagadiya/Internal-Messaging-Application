import { Component, Input, OnInit } from '@angular/core';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { SignalrService } from 'src/app/core/service/signalR.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
    selector: 'app-chat-message-header',
    templateUrl: 'chat-message-header.component.html',
    styleUrls : ['chat-message-header.component.scss']
})

export class ChatMessageHeaderComponent implements OnInit {
    constructor(
        private userService : UserService,
        private signalrService : SignalrService
    ) { }


    @Input() selectedUser : LoggedInUser
    user : LoggedInUser

    ngOnInit() {

        this.userService.getUserSubject().subscribe((e) => {
            this.user = e;
        });

        this.signalrService.hubConnection.on("updateProfileStatus", (status : string, username : string) => {
            if(this.selectedUser.userName === username){
                this.selectedUser.profileStatus = status;
            }
        });
    }

    //get profile url
    getProfile(user: LoggedInUser) {
        return this.userService.getProfileUrl(user.imageUrl);
    }

}