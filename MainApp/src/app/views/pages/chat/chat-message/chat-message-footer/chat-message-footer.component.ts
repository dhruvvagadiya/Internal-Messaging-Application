import { Component, Input, OnInit } from '@angular/core';
import { MessageModel } from 'src/app/core/models/chat/message-model';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { ChatService } from 'src/app/core/service/chat-service';
import { SignalrService } from 'src/app/core/service/signalR-service';
import { UserService } from 'src/app/core/service/user-service';

@Component({
  selector: "app-chat-message-footer",
  templateUrl: "chat-message-footer.component.html",
  styleUrls: ["chat-message-footer.component.scss"],
})
export class ChatMessageFooterComponent implements OnInit {
  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private signalrService: SignalrService
  ) {}

  @Input() replyMsgId: number;
  @Input() replyMsgContent: string;
  @Input() selectedUser: LoggedInUser;

  user: LoggedInUser;
  file: File;

  ngOnInit() {
    this.userService.getUserSubject().subscribe((e) => {
      this.user = e;
    });
  }

  //get profile url
  getProfile(user: LoggedInUser) {
    return this.userService.getProfileUrl(user.imageUrl);
  }

  //send message
  sendMessage(event: HTMLInputElement) {
    //if there is not input and also no file uploaded
    if (event.value.length === 0 && this.file === null) {
      return;
    }

    const formData = new FormData();

    if (this.file) {
      formData.append("file", this.file);
    }
    formData.append("sender", this.user.userName);
    formData.append("receiver", this.selectedUser.userName);
    formData.append("type", this.file ? "file" : "text");
    formData.append("content", event.value);

    if (this.replyMsgId) {
      formData.append("repliedTo", "" + this.replyMsgId);
    }

    this.chatService.sendChat(this.selectedUser.userName, formData).subscribe(
      () => {
        this.signalrService.hubConnection.invoke('GetRecentChat', this.user.userName, this.selectedUser.userName);
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

  
  closeMsgAndFile(){
    this.file = null;
    this.replyMsgId = null;
  }
}