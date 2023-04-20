import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GroupMember } from 'src/app/core/models/Group/group-member';
import { Group } from 'src/app/core/models/Group/group';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat-service';
import { GroupService } from 'src/app/core/service/group-service';
import { SignalrService } from 'src/app/core/service/signalR-service';
import { UserService } from 'src/app/core/service/user-service';

@Component({
  selector: "app-add-members-modal",
  templateUrl: "./add-members.component.html",
  styleUrls: ["add-members.component.scss"],
})
export class AddMembersModal implements OnInit{
  constructor(
    private groupService: GroupService,
    private signalrService: SignalrService,
    private userService: UserService,
    private groupChatService : GroupChatService
  ) {}

  @Input() modal;
  @Input() memberList: GroupMember[];
  @Input() allContacts: LoggedInUser[];
  
  selectedGroup: Group;
  
  ngOnInit(): void {
    this.groupChatService.groupChanged.subscribe(e => {
      this.selectedGroup = e
    });
  }


  @Output() OnAddMembers = new EventEmitter<GroupMember []>();

  selectedUsers = [];

  addUsers() {
    if (this.selectedUsers.length > 0) {
      this.groupService
        .addMembers(this.selectedUsers, this.selectedGroup.id)
        .subscribe((e: GroupMember[]) => {
          this.signalrService.updateMemberList(this.selectedGroup.id, e);
        });
        
      this.signalrService.addMembers(this.selectedUsers, this.selectedGroup);
      this.selectedUsers = [];
    }
  }

  getProfile(url: string) {
    return this.userService.getProfileUrl(url);
  }
}
