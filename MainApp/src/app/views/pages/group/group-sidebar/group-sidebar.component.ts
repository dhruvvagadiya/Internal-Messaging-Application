import { Component, OnInit, TemplateRef } from "@angular/core";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { GroupChatService } from "src/app/core/service/group-chat.service";
import { GroupRecentChatModel } from "src/app/core/models/GroupChat/group-recent-chat";
import { UserService } from "src/app/core/service/user.service";
import { Group } from "src/app/core/models/Group/group";
import { SignalrService } from "src/app/core/service/signalR.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-group-sidebar",
  templateUrl: "group-sidebar.component.html",
  styleUrls: ["group-sidebar.component.scss"],
})
export class GroupSideBarComponent implements OnInit {

  recentGroups: GroupRecentChatModel [] = [];
  user: LoggedInUser;

  constructor(
    private groupChatService: GroupChatService,
    private userService : UserService,
    private signalrService : SignalrService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {

    this.userService.getUserSubject().subscribe(e => {
      this.user = e;
    });

    //get recent chat
    this.groupChatService.getRecentGroups().subscribe((res: GroupRecentChatModel[]) => {
      this.recentGroups = res;
    });
    
    //update recent group list
    this.signalrService.hubConnection.on("updateRecentGroup", (obj : GroupRecentChatModel) => {

      //remove curObj from list if exists
      this.recentGroups = this.recentGroups.filter(e => e.group.id !== obj.group.id);

      //add cur obj if chat exists
      if(obj.lastMsgTime){
        this.recentGroups.push(obj);

        this.recentGroups.sort(function(a : GroupRecentChatModel, b : GroupRecentChatModel) {
          const date1 = new Date(a.lastMsgTime).getTime();
          const date2 = new Date(b.lastMsgTime).getTime();
  
          return date2 - date1;
        });
      }
    
    });

    //leave from group -> remove from list
    this.signalrService.hubConnection.on("leaveFromGroup", (groupId : number, userName : string) => {      
      if(this.user.userName === userName){
        this.recentGroups = this.recentGroups.filter(e => e.group.id !== groupId);
      }
    });

    //update group details
    this.signalrService.hubConnection.on("groupUpdated", (obj : Group) => {
      var cur = this.recentGroups.find(e => e.group.id == obj.id);
      cur.group = obj;
    })
  
  }

  SelectGroup(group :Group){
    this.groupChatService.groupChanged.next(group);
  }

  getGroupProfile(url: string) {
    return this.groupChatService.getProfileUrl(url);
  }
  
  getProfile(user: LoggedInUser) {
    return this.userService.getProfileUrl(user.imageUrl);
  }
  
  getLastMsg(msg : string){
    if(!msg) return '';

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

    var rtObj = cur.toLocaleDateString();
    return rtObj === '1/1/1' ? '' : rtObj;
  }

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, {centered: true}).result.then((result) => {
    }).catch((res) => {});
  }

}
