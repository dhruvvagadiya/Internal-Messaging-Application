import { Component, Input, OnInit } from "@angular/core";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { RecentChatModel } from "src/app/core/models/chat/recent-chat";
import { ChatService } from "src/app/core/service/chat.service";
import { UserService } from "src/app/core/service/user.service";
import { SignalrService } from "src/app/core/service/signalR.service";

@Component({
  selector: "app-chat-sidebar",
  templateUrl: "chat-sidebar.component.html",
})
export class ChatSideBarComponent implements OnInit {
  defaultNavActiveId = 1;
  userMatched = [];
  openMenu = false;
  timeOutId;

  isHover = false;

  recentChats: RecentChatModel[] = [];
  @Input() user: LoggedInUser;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private signalrService : SignalrService
  ) {}

  ngOnInit() {
    //get recent chat
    this.chatService.getRecentUsers().subscribe((res: RecentChatModel[]) => {
      this.recentChats = res;
    });
    
    this.signalrService.hubConnection.on("updateRecentChat", (obj : RecentChatModel) => {

      //remove curObj from list if exists
      this.recentChats = this.recentChats.filter(e => e.userName !== obj.userName);

      //add cur obj if chat exists
      if(obj.lastMsgTime){
        this.recentChats.push(obj);

        this.recentChats.sort(function(a : RecentChatModel, b : RecentChatModel) {
          const date1 = new Date(a.lastMsgTime).getTime();
          const date2 = new Date(b.lastMsgTime).getTime();
  
          return date2 - date1;
        });
      }
    
    });
  }

  //hide menu
  hideMenu() {
    this.openMenu = false;
  }

  //debouncing of user search request
  searchUsers(event) {
    if (this.timeOutId) {
      clearTimeout(this.timeOutId);
    }

    this.timeOutId = setTimeout(() => {
      this.userService
        .getUsers(event.target.value)
        .subscribe((res: { data: [] }) => {
          this.userMatched = res.data;
        });
    }, 1000);
  }

  //get users on input
  onInput(event) {

    //if no string is entered do nothing
    
    if (event.target.value === null || event.target.value.length === 0) {
      this.userMatched = [];
      clearTimeout(this.timeOutId);
      return;
    }

    this.openMenu = true;
    this.searchUsers(event);
  }

  markAsSeen(event : Event, username : string){
    event.preventDefault();
    event.stopPropagation();   //avoid routing

    this.signalrService.seenMessages(username, this.user.userName);
  }

  markAllAsSeen() {
    this.recentChats.forEach(e => {
      this.signalrService.seenMessages(e.userName, this.user.userName);
    })
  }

  getProfileUrl(url: string) {
    return this.userService.getProfileUrl(url);
  }

  //reload recent chats
  reloadRecentChat(){
    this.chatService.getRecentUsers().subscribe((res: RecentChatModel[]) => {
      this.recentChats = res;
    });
  }

  getLastMsg(msg : string){
    if(!msg) return 'file';

    if(msg.length > 15){
      return msg.substring(0, 15) + "...";
    }
    return msg;
  }

  //last msg time
  getTime(str : Date){

    let cur = new Date(str);
    
    const yesterday = new Date();

    if(cur.getDate() === yesterday.getDate() &&
    cur.getMonth() === yesterday.getMonth() &&
    cur.getFullYear() === yesterday.getFullYear()){

      var hours = cur.getHours();
      var minutes = '' + cur.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = cur.getMinutes() < 10 ? '0' + minutes : minutes;

      return hours + ':' + minutes + ' ' + ampm;
      
    }

    yesterday.setDate(yesterday.getDate() - 1)

    if(cur.getDate() === yesterday.getDate() &&
      cur.getMonth() === yesterday.getMonth() &&
      cur.getFullYear() === yesterday.getFullYear()){
        return "Yesterday"
    }

    return cur.toLocaleDateString();
  }
}
