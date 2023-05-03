import {
  Component,
  OnInit,
} from "@angular/core";

import { LoggedInUser } from "src/app/core/models/user/loggedin-user";

import { UserService } from "src/app/core/service/user.service";
import { GroupChatModel } from "src/app/core/models/GroupChat/group-message-model";
import { GroupChatService } from "src/app/core/service/group-chat.service";
import { Group } from "src/app/core/models/Group/group";
import { SignalrService } from "src/app/core/service/signalR.service";

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

  messageList: GroupChatModel[] = [];

  constructor(
    private userService: UserService,
    private groupChatService : GroupChatService,
    private signalrService : SignalrService,
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
      this.messageList.push(value);
    });

    //update group details
    this.signalrService.hubConnection.on("groupUpdated", (obj : Group) => {
      if(obj.id === this.selectedGroup.id){
        this.groupChatService.groupChanged.next(obj);
      }
    })
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
    this.replyMsgId = event.id;
    this.replyMsgContent = event.content;
  }

}
