import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { LoggedInUser } from "src/app/core/models/loggedin-user";
import { MessageModel } from "src/app/core/models/message-model";
import { ChatService } from "src/app/core/service/chat-service";
import { UserService } from "src/app/core/service/user-service";

@Component({
  selector: "<app-chat-message>",
  templateUrl: "chat-message.component.html",
})
export class ChatMessageComponent implements OnInit {
  user: LoggedInUser;
  selectedUser: LoggedInUser;
  thumbnail = "https://via.placeholder.com/80x80";

  isLoading = false;

  messageList: MessageModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    console.log("init");

    this.userService.user.subscribe((e) => {
      this.user = e;

      if (e != null && this.user.imageUrl) {
        this.thumbnail = this.userService.getProfileUrl(e);
      }
    });

    //get initial values
    this.userService.getLoggedInUser().subscribe((e) => (this.user = e));

    this.route.params.subscribe((data : Params) => {
        let uName: string;
        uName = data["userName"];
        // console.log(uName);

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

  sendMessage(event: HTMLInputElement) {
    if (event.value.length > 0) {
      this.chatService
        .sendChat(this.selectedUser.userName, {
          sender: this.user.userName,
          receiver: this.selectedUser.userName,
          content: event.value,
          type: "text",
        })
        .subscribe(
          (res: MessageModel) => {
            this.messageList.push(res);
          },
          (err) => {
            console.log(err);
          }
        );
      event.value = "";
    }
  }

  getProfile(user: LoggedInUser) {
    return this.userService.getProfileUrl(user);
  }

  // back to chat-list for tablet and mobile devices
  backToChatList() {
    document.querySelector(".chat-content").classList.toggle("show");
  }
}
