import {
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";

import { LoggedInUser } from "src/app/core/models/user/loggedin-user";

import { UserService } from "src/app/core/service/user-service";
import { GroupChatModel } from "src/app/core/models/GroupChat/group-message-model";
import { GroupChatService } from "src/app/core/service/group-chat-service";
import { Group } from "src/app/core/models/GroupChat/group";
import { SignalrService } from "src/app/core/service/signalR-service";

@Component({
  selector: "app-group-main",
  templateUrl: "./group-main.component.html",
  styleUrls : ["./group-main.component.scss"]
})

export class GroupMainComponent implements OnInit {

  user: LoggedInUser;
  selectedGroup : Group;
  

  replyMsgId?: number;
  replyMsgContent: string;
  file : File;

  @ViewChild('messageInput') MessageInput;

  messageList: GroupChatModel[] = [];

  constructor(
    private userService: UserService,
    private groupChatService : GroupChatService,
    private signalrService : SignalrService
  ) {}

  ngOnInit() {

    this.groupChatService.groupChanged.subscribe(e => {
      this.selectedGroup = e; 
      if(this.selectedGroup){
        this.loadChat();
      }     
    });

    this.userService.getUserSubject().subscribe(e => {
      this.user = e;
    });

    this.signalrService.hubConnection.on('receiveMessage', (value : GroupChatModel) => {
      
      //DO NOT PUSH IF IT IS CURUSER
      if(value.messageFrom !== this.user.userName){
        this.messageList.push(value);
      }
      
    });
  }


  loadChat(){
    this.groupChatService.getChatOfGroup(this.selectedGroup.id).subscribe(
      (res: GroupChatModel[]) => {
        this.messageList = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  replyMsg(event){

    //get cursor on the input tag on click
    this.MessageInput.nativeElement.focus();
    
    this.replyMsgId = event.id;
    this.replyMsgContent = event.content;
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

          this.messageList.push(res);
          
          //generate event to send msg to receiver
          if(this.signalrService.hubConnection){
            this.signalrService.sendGroupMessage(res);
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
