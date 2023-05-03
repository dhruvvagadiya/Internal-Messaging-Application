import {
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { ChatService } from "src/app/core/service/chat.service";
import { UserService } from "src/app/core/service/user.service";
import { SignalrService } from "src/app/core/service/signalR.service";
import { MessageModel } from "src/app/core/models/chat/message-model";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls : ["./chat-message.component.scss"]
})

export class ChatMessageComponent implements OnInit, OnDestroy {
  user: LoggedInUser;
  selectedUser: LoggedInUser;
  thumbnail = "https://via.placeholder.com/80x80";

  replyMsgId?: number;
  replyMsgContent: string;

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
      this.thumbnail = this.userService.getProfileUrl(e?.imageUrl);
    });

    //load chat of particular user if route param is changed
    this.route.params.subscribe((data: Params) => {
      
      this.replyMsgId = null;
      this.replyMsgContent = '';
      
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
      
      //NOTIFY SELECTED USER THAT CUR_USER HAS SEEN MESSAGES
      this.signalrService.seenMessages(uName, this.user.userName);

    });

    //push message to list
    this.signalrService.hubConnection.on('receiveMessage', (value : MessageModel) => {
      
      this.messageList.push(value);

      //CHECK IF USER IS RECEIVER AND ALSO CUR PAGE IS OF SENDER
      if(value.messageTo === this.user.userName && value.messageFrom === this.selectedUser.userName){
        //SEND SENDER EVENT THAT RECEIVER HAS SEEN MSGS
        this.signalrService.seenMessages(this.selectedUser.userName, this.user.userName);
      }
    });

    //if receiver has seen the msgs
    this.signalrService.hubConnection.on('seenMessage', () => {
      
      //if cur user is sender
      this.messageList.forEach(e => {
        if(e.messageFrom == this.user.userName){
          e.seenByReceiver = 1;
        }
      });
    })

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

  replyClicked(event){
    this.replyMsgId = event.id;
    this.replyMsgContent = event.content;
  }  

  ngOnDestroy(): void {
    this.selectedUser = null; 
  }
}
