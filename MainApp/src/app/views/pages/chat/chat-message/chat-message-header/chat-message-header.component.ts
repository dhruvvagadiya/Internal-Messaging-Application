import { Component, Input, OnInit } from '@angular/core';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { UserService } from 'src/app/core/service/user-service';

@Component({
    selector: 'app-chat-message-header',
    templateUrl: 'chat-message-header.component.html'
})

export class ChatMessageHeaderComponent implements OnInit {
    constructor(
        private userService : UserService
    ) { }


    @Input() selectedUser : LoggedInUser

    ngOnInit() { }

    //get profile url
    getProfile(user: LoggedInUser) {
        return this.userService.getProfileUrl(user.imageUrl);
    }

}