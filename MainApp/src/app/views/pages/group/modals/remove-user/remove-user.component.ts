import { Component, Input, OnInit } from '@angular/core';
import { Group } from 'src/app/core/models/Group/group';
import { GroupMember } from 'src/app/core/models/Group/group-member';
import { GroupChatService } from 'src/app/core/service/group-chat.service';
import { GroupService } from 'src/app/core/service/group.service';
import { SignalrService } from 'src/app/core/service/signalR.service';

@Component({
    selector: 'app-remove-user-modal',
    templateUrl: 'remove-user.component.html'
})

export class RemoveUserModalComponent implements OnInit {
    constructor(
        private groupService : GroupService,
        private signalrService : SignalrService,
        private groupChatService : GroupChatService,
    ) { }

    @Input() modal;
    @Input () toBeRemoveUser : GroupMember

    selectedGroup : Group

    ngOnInit() {
        this.groupChatService.groupChanged.subscribe(e => {
            this.selectedGroup = e
        });
    }
    
    removeMember(userName : string){
        this.groupService.removeMember(userName, this.selectedGroup.id).subscribe(e => {});
        this.signalrService.leaveFromGroup(this.selectedGroup.id, userName, true, this.selectedGroup.name);
    }
}