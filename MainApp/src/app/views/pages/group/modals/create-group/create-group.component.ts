import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Group } from 'src/app/core/models/Group/group';
import { GroupRecentChatModel } from 'src/app/core/models/GroupChat/group-recent-chat';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat.service';
import { GroupService } from 'src/app/core/service/group.service';

@Component({
  selector: 'app-create-group-modal',
  templateUrl: './create-group.component.html'
})
export class CreateGroupModalComponent {

  createGroupData = { name: '', description: '' };
  thumbnail : any = "https://w7.pngwing.com/pngs/754/2/png-transparent-samsung-galaxy-a8-a8-user-login-telephone-avatar-pawn-blue-angle-sphere-thumbnail.png";
  file : File;

  @Input() modal;
  @Input() user : LoggedInUser;
  @Output() onGroupCreate = new EventEmitter<GroupRecentChatModel>();

  constructor(
    private groupService : GroupService,
    private groupChatService : GroupChatService
  ){
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

  createGroup(){
    var formdata = new FormData();
    formdata.append('userName', this.user.userName);
    formdata.append('groupName', this.createGroupData.name);
    formdata.append('description', this.createGroupData.description);

    if(this.file){
      formdata.append('profileImage', this.file);
    }

    this.groupService.createGroup(formdata).subscribe((res : Group) => {
      
      var obj : GroupRecentChatModel = {
        group : res,
        firstName : this.user.firstName,
        lastName : this.user.lastName,
        imageUrl : this.user.imageUrl,
        lastMessage : null,
        lastMsgTime : res.createdAt
      };

      //update recent group
      this.onGroupCreate.emit(obj);
      this.groupChatService.groupChanged.next(res);
    });

    this.file = null;
    this.createGroupData.name = '';
    this.createGroupData.description = '';
    
  }
}
