import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggedInUser } from 'src/app/core/models/loggedin-user';
import { RecentChatModel } from 'src/app/core/models/recent-chat';
import { AuthService } from 'src/app/core/service/auth-service';
import { ChatService } from 'src/app/core/service/chat-service';
import { UserService } from 'src/app/core/service/user-service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-chat-sidebar',
    templateUrl: 'chat-sidebar.component.html'
})

export class ChatSideBarComponent implements OnInit {

    defaultNavActiveId = 1;
    userMatched = [];
    openMenu = false;
    timeOutId;
    
    
    // @Input() recentChats : RecentChatModel [];
    recentChats : RecentChatModel [];
    @Input() user : LoggedInUser;
    // @Output() selectedUser = new EventEmitter<LoggedInUser>();
    
    constructor(private userService : UserService, private authService :AuthService, private chatService : ChatService) {
    }

    ngOnInit() {
      this.user = this.authService.getLoggedInUserInfo();

      //get recent chat
      this.chatService.getRecentUsers().subscribe(
        (res : RecentChatModel []) => {
          this.recentChats = res;
        }
      );
    }

    // selectUser(user : LoggedInUser){
    //   this.selectedUser.emit(user);
    // }

      //hide menu
    hideMenu(){
      this.openMenu = false;
    }

      //debouncing of request
    searchUsers (event) {

        if(this.timeOutId){
        clearTimeout(this.timeOutId);
        }

        this.timeOutId = setTimeout(() => {
        this.userService.getUsers(event.target.value).subscribe(
            (res : {data : []}) => {
            this.userMatched = res.data;
            }
        )
        }, 1000);

    }

      //get users on input
    onInput(event){

        //if no string is entered
        if(event.target.value === null || event.target.value.length === 0){
          this.userMatched = [];
          clearTimeout(this.timeOutId);
          return;
        }

        this.openMenu = true;
        this.searchUsers(event);
    }

    getProfile(user : LoggedInUser){
        if(user && user.imageUrl) {
          return environment.hostUrl + "/images/" + user.imageUrl
        }
        return "https://via.placeholder.com/80x80";
    }
}