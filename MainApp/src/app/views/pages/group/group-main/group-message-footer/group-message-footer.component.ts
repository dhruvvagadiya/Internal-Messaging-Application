import { Component, Input, OnInit } from '@angular/core';
import { Group } from 'src/app/core/models/Group/group';
import { GroupChatModel } from 'src/app/core/models/GroupChat/group-message-model';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat-service';
import { SignalrService } from 'src/app/core/service/signalR-service';
import { UserService } from 'src/app/core/service/user-service';

@Component({
    selector: 'app-group-message-footer',
    templateUrl: 'group-message-footer.component.html',
    styleUrls : ['group-message-footer.component.scss']
})

export class GroupMessageFooterComponent implements OnInit {
    constructor(
        private userService : UserService,
        private groupChatService : GroupChatService,
        private signalrService : SignalrService
    ) { }

    @Input() replyMsgId : number
    @Input() replyMsgContent : string

    file : File
    user : LoggedInUser
    selectedGroup : Group

    ngOnInit() {
        this.userService.getUserSubject().subscribe(e => {
            this.user = e;
        });

        this.groupChatService.groupChanged.subscribe(e => {
            this.selectedGroup = e;    
        });
    }

      //send message
  sendMessage(event: HTMLInputElement) {

    //if there is not input and also no file uploaded
    if(event.value.length === 0 && this.file === null){
      return;
    }

    const formData = new FormData();

    if(this.file){
      formData.append('file', this.file);
    }
    formData.append('sender', this.user.userName);
    formData.append('type', this.file ? 'file' : 'text');
    formData.append('content', event.value);
    formData.append('groupId', '' + this.selectedGroup.id);


    if(this.replyMsgId){
      formData.append('repliedTo', '' + this.replyMsgId);
    }
    

    this.groupChatService
      .sendChat(this.selectedGroup.id, formData)
      .subscribe(
        (res: GroupChatModel) => {
          
          //generate event to send msg to receiver
          if(this.signalrService.hubConnection){
            this.signalrService.sendGroupMessage(res, this.selectedGroup.name);
            this.signalrService.updateRecentGroup(this.selectedGroup, res);
          }

        },
        (err) => {
          console.log(err);
        }
      );
    
    this.replyMsgId = null;
    event.value = "";
    this.file = null;
  }

  //add file to form at each change
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
    }
  }

  closeMsgAndFile(){
    this.file = null;
    this.replyMsgId = null;
  }

  addEmoji(event, messageInput : HTMLInputElement){
    const text = messageInput.value + event.emoji.native;
    messageInput.value = text;
    this.showEmojiPicker = false;
  }

  showEmojiPicker = false;
  toggleEmojiPicker(messageInput : HTMLInputElement){
    messageInput.focus();
    this.showEmojiPicker = !this.showEmojiPicker;
  }
}