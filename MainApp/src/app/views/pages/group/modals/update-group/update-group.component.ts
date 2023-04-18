import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Group } from 'src/app/core/models/GroupChat/group';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat-service';
import { GroupService } from 'src/app/core/service/group-service';
import { SignalrService } from 'src/app/core/service/signalR-service';

@Component({
  selector: 'app-update-group-modal',
  templateUrl: './update-group.component.html',
})
export class UpdateGroupModalComponent implements OnInit {

  thumbnail : any = "https://w7.pngwing.com/pngs/754/2/png-transparent-samsung-galaxy-a8-a8-user-login-telephone-avatar-pawn-blue-angle-sphere-thumbnail.png";
  file : File;

  @Input() modal;
  @Input() user : LoggedInUser;
  @Input() selectedGroup : Group
  @Output() OnGroupUpdate = new EventEmitter<Group>();

  updateGroupData;

  constructor(
    private groupService : GroupService,
    private signalrService : SignalrService,
    private groupChatService : GroupChatService
  ){
  }

  ngOnInit(): void {
    this.updateGroupData = {
      name : this.selectedGroup.name,
      description : this.selectedGroup.description
    }

    this.thumbnail = this.getGroupProfile(this.selectedGroup.imageUrl);
  }

  onFileChanged(event) {
    if (event.target.files.length > 0) {
    this.file = event.target.files[0];

    //show sample profile image on screen
    var reader = new FileReader();
        reader.onload = (e) => {
            this.thumbnail = e.target.result;
        };
    reader.readAsDataURL(this.file);

    }
  }

  updateGroup(){
    var formdata = new FormData();
    formdata.append('userName', this.user.userName);
    formdata.append('groupId', ''+this.selectedGroup.id);
    formdata.append('groupName', this.updateGroupData.name);
    formdata.append('description', this.updateGroupData.description);

    if(this.file){
      formdata.append('profileImage', this.file);
    }

    this.groupService.updateGroup(formdata).subscribe((res : Group) => {
        this.OnGroupUpdate.emit(res);
        this.signalrService.updateGroup(res);
    });        
  }

  getGroupProfile(url: string) {
    return this.groupChatService.getProfileUrl(url);
  }

}
