import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MessageModel } from 'src/app/core/models/chat/message-model';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { UserService } from 'src/app/core/service/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-chat-message-body",
  templateUrl: "chat-message-body.component.html",
  styleUrls : ['./chat-message-body.component.scss']
})
export class ChatMessageBodyComponent implements OnInit, AfterViewChecked {
  constructor(private userService: UserService) {}

  replyMsgId?: number;
  replyMsgContent: string;
  user: LoggedInUser;

  @Input() selectedUser: LoggedInUser;
  @Input() messageList: MessageModel[];
  @Output() onReplyClick = new EventEmitter<{id : number, content : string}>();

  ngOnInit() {
    this.userService.getUserSubject().subscribe(e => {
      this.user = e;
    });
  }

  //get profile url
  getProfile(user: LoggedInUser) {
    return this.userService.getProfileUrl(user.imageUrl);
  }

  getMsgUrl(filePath: string) {
    return environment.hostUrl + "/chat/" + filePath;
  }

  //set reply msg id and content
  replyMsg(id: number, content: string) {
    this.onReplyClick.emit({id, content});
  }

  //scroll msg after they are rendered on screen
  @ViewChild("scrollContainer") scrollContainer: ElementRef;
  ngAfterViewChecked(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}