import { Component, Input, OnInit } from '@angular/core';
import { LoggedInUser } from 'src/app/core/models/loggedin-user';
import { MessageModel } from 'src/app/core/models/message-model';
import { ChatService } from 'src/app/core/service/chat-service';
import { UserService } from 'src/app/core/service/user-service';

@Component({
    selector: '<app-chat-message>',
    templateUrl: 'chat-message.component.html'
})

export class ChatMessageComponent implements OnInit {

    @Input() user : LoggedInUser
    @Input() selectedUser : LoggedInUser

    messageList : MessageModel[] = [];

    constructor(private userService : UserService, private chatService : ChatService) { }

    ngOnInit() {
        this.chatService.getChatWithUser(this.selectedUser.userName).subscribe(
            (res : MessageModel[]) => {
                this.messageList = res;
            },
            err => {
                console.log(err);
            }
        )
    }

    sendMessage(event: HTMLInputElement) {
        if (event.value.length > 0) {
            this.chatService.sendChat(this.selectedUser.userName, {
                sender: this.user.userName,
                receiver: this.selectedUser.userName,
                content: event.value,
                type: "text"
            }).subscribe(
                (res: MessageModel) => {
                    this.messageList.push(res);
                },
                err => {
                    console.log(err);
                }
            );
            event.value = "";
        }
    }

    getProfile(user : LoggedInUser){
        return this.userService.getProfileUrl(user);
    }

      // back to chat-list for tablet and mobile devices
    backToChatList() {
        document.querySelector('.chat-content').classList.toggle('show');
    }
}