import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { MessageModel } from "src/app/core/models/chat/message-model";
import { ChatService } from "src/app/core/service/chat-service";
import { UserService } from "src/app/core/service/user-service";
import { environment } from "src/environments/environment";
import { SignalrService } from "src/app/core/service/signalR-service";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls : ["./chat-message.component.scss"]
})

export class ChatMessageComponent implements OnInit, AfterViewChecked, OnDestroy {
  user: LoggedInUser;
  selectedUser: LoggedInUser;
  thumbnail = "https://via.placeholder.com/80x80";

  replyMsgId?: number;
  replyMsgContent: string;
  file : File;

  @ViewChild('messageInput') MessageInput;

  messageList: MessageModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService,
    private signalrService : SignalrService
  ) {}

  ngOnInit() {

    this.userService.getUserSubject().subscribe(e => {
      this.user = e;
      this.thumbnail = this.userService.getProfileUrl(e);
    });

    //load chat of particular user if route param is changed
    this.route.params.subscribe((data: Params) => {

      this.replyMsgId = null;
      this.file = null;

      let uName: string;
      uName = data["userName"];

      //get selected user
      this.userService.getUser(uName).subscribe((e) => (this.selectedUser = e));

      //get chat
      this.chatService.getChatWithUser(uName).subscribe(
        (res: MessageModel[]) => {
          this.messageList = res;        
        },
        (err) => {
          console.log(err);
        }
      );
    });

      //start connection with hub  (will end on logout)
      this.signalrService.startConnection(this.user.userName);

      //push message to list
      this.signalrService.hubConnection.on('receiveMessage', (value : MessageModel) => {
        
        //IF USER IS SENDER AND CUR MSG IS READ THEN MAKE ALL PREV MSGS READ
        if(value.messageFrom == this.user.userName && value.seenByReceiver == 1){
          this.messageList.forEach(e => {
            e.seenByReceiver = 1;
          })  
        }
        
        if(value.messageFrom !== this.user.userName){
          this.messageList.push(value);
        }
        
      });
  }

  //scroll msg after they are rendered on screen
  @ViewChild("scrollContainer") scrollContainer: ElementRef;
  ngAfterViewChecked(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  //reaload chat
  reloadChat() {
    this.chatService.getChatWithUser(this.selectedUser.userName).subscribe(
      (res: MessageModel[]) => {
        this.messageList = res;
      },
      (err) => {
        console.log(err);
      }
    );
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
    formData.append('receiver', this.selectedUser.userName);
    formData.append('type', this.file ? 'file' : 'text');
    formData.append('content', event.value);

    if(this.replyMsgId){
      formData.append('repliedTo', '' + this.replyMsgId);
    }
    

    this.chatService
      .sendChat(this.selectedUser.userName, formData)
      .subscribe(
        (res: MessageModel) => {

          // because if user is online bydefault seen will not be true
          this.messageList.push(res);

          //generate event to send msg to receiver
          if(this.signalrService.hubConnection){
            this.signalrService.sendMessage(res);
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

  //set reply msg id and content
  replyMsg(id: number, content: string) {

    //get cursor on the input tag on click
    this.MessageInput.nativeElement.focus();
    
    this.replyMsgId = id;
    this.replyMsgContent = content;
  }

  closeMsgAndFile(){
    this.file = null;
    this.replyMsgId = null;
  }

  //get profile url
  getProfile(user: LoggedInUser) {
    return this.userService.getProfileUrl(user);
  }

  getMsgUrl(filePath : string){
    return environment.hostUrl + "/chat/" + filePath;
  }

  // back to chat-list for tablet and mobile devices
  backToChatList() {
    document.querySelector(".chat-content").classList.toggle("show");
  }

  ngOnDestroy(): void {
    this.signalrService.hubConnection.off("askServerResponse");
  }
}
