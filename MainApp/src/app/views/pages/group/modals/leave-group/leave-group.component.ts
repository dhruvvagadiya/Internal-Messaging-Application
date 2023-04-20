import { Component, Input, OnInit } from '@angular/core';
import { Group } from 'src/app/core/models/Group/group';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat-service';
import { GroupService } from 'src/app/core/service/group-service';
import { SignalrService } from 'src/app/core/service/signalR-service';
import { UserService } from 'src/app/core/service/user-service';

@Component({
    selector: 'app-leave-group-modal',
    templateUrl: 'leave-group.component.html'
})

export class LeaveGroupModalComponent implements OnInit {
    constructor(
        private groupService : GroupService,
        private signalrService : SignalrService,
        private groupChatService : GroupChatService,
        private userService : UserService
    ) { }

    @Input() modal;
    selectedGroup : Group
    user : LoggedInUser

    ngOnInit() {

        this.userService.getUserSubject().subscribe(e => {
            this.user = e;
        });

        this.groupChatService.groupChanged.subscribe(e => {
            this.selectedGroup = e
        });
    }

    leaveFromGroup(){
        this.groupService.leaveFromGroup({groupId : this.selectedGroup.id, userName : this.user.userName}).subscribe(() =>{});
        
        this.signalrService.leaveFromGroup(this.selectedGroup.id, this.user.userName, false);
        this.groupChatService.groupChanged.next(null);
    }
}