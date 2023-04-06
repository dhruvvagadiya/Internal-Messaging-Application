import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { MessageModel } from "src/app/core/models/chat/message-model";
import { ChatService } from "src/app/core/service/chat-service";
import { UserService } from "src/app/core/service/user-service";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls : ["./chat-message.component.scss"]
})

export class ChatMessageComponent implements OnInit, AfterViewChecked, OnDestroy {
  user: LoggedInUser;
  selectedUser: LoggedInUser;
  thumbnail = "https://via.placeholder.com/80x80";

  isLoading = false;
  replyMsgId?: number;
  replyMsgContent: string;

  messageList: MessageModel[] = [];
  subscription : Subscription;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService
  ) {}

  ngOnInit() {

    this.subscription = this.userService.user.subscribe((e) => {
      this.user = e;

      if (e != null && this.user.imageUrl) {
        this.thumbnail = this.userService.getProfileUrl(e);
      }
    });

    //get initial values
    // this.userService.getLoggedInUser().subscribe((e) => (this.user = e));

    //load chat of particular user if route param is changed
    this.route.params.subscribe((data: Params) => {

      this.replyMsgId = null;

      let uName: string;
      uName = data["userName"];

      //get selected user
      this.userService.getUser(uName).subscribe((e) => (this.selectedUser = e));

      //get chat
      this.isLoading = true;
      this.chatService.getChatWithUser(uName).subscribe(
        (res: MessageModel[]) => {
          this.messageList = res;
        },
        (err) => {
          console.log(err);
        }
      );
      this.isLoading = false;
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
    this.isLoading = true;
    this.chatService.getChatWithUser(this.selectedUser.userName).subscribe(
      (res: MessageModel[]) => {
        this.messageList = res;
      },
      (err) => {
        console.log(err);
      }
    );
    this.isLoading = false;
  }

  //send message
  sendMessage(event: HTMLInputElement) {
    if (event.value.length > 0) {
      this.chatService
        .sendChat(this.selectedUser.userName, {
          sender: this.user.userName,
          receiver: this.selectedUser.userName,
          content: event.value,
          type: "text",
          repliedTo : this.replyMsgId
        })
        .subscribe(
          (res: MessageModel) => {
            this.messageList.push(res);
          },
          (err) => {
            console.log(err);
          }
        );
      
      this.replyMsgId = null;
      event.value = "";
    }
  }

  //get profile url
  getProfile(user: LoggedInUser) {
    return this.userService.getProfileUrl(user);
  }

  //set reply msg id and content
  replyMsg(id: number, content: string) {
    this.replyMsgId = id;
    this.replyMsgContent = content;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // back to chat-list for tablet and mobile devices
  backToChatList() {
    document.querySelector(".chat-content").classList.toggle("show");
  }

}
