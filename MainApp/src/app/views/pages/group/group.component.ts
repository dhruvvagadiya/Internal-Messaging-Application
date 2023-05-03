import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Group } from 'src/app/core/models/Group/group';

import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { GroupChatService } from 'src/app/core/service/group-chat.service';
import { UserService } from 'src/app/core/service/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})

export class GroupComponent implements OnInit, AfterViewInit {

  loggedInUser: LoggedInUser
  thumbnail = "https://via.placeholder.com/80x80";

  selectedGroup : Group;

  constructor(private userService : UserService, private groupChatService : GroupChatService) { }

  ngOnInit(): void {

    this.userService.getUserSubject().subscribe(e => {
      this.loggedInUser = e;
      this.thumbnail = this.userService.getProfileUrl(e?.imageUrl);
    });
    
    this.groupChatService.groupChanged.subscribe(e => {
      this.selectedGroup = e;
    })
  }

  ngAfterViewInit(): void {

    // Show chat-content when clicking on chat-item for tablet and mobile devices
    document.querySelectorAll('.chat-list .chat-item').forEach(item => {
      item.addEventListener('click', event => {
        document.querySelector('.chat-content').classList.toggle('show');
      })
    });

  }

  // back to chat-list for tablet and mobile devices
  backToChatList() {
    document.querySelector('.chat-content').classList.toggle('show');
  }

  save() {
    console.log('passs');
  }

}
