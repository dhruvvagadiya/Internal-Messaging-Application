import { Component, OnInit, AfterViewInit } from '@angular/core';

import { LoggedInUser } from 'src/app/core/models/loggedin-user';
import { UserService } from 'src/app/core/service/user-service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, AfterViewInit {

  loggedInUser: LoggedInUser
  thumbnail = "https://via.placeholder.com/80x80";

  constructor(private userService : UserService) { }

  ngOnInit(): void {

    this.userService.user.subscribe(e => {
      this.loggedInUser = e;

      if(e != null && this.loggedInUser.imageUrl) {
        this.thumbnail = this.userService.getProfileUrl(e);
      }
    });
    
    //get initial values
    this.userService.getLoggedInUser().subscribe(
      e => this.loggedInUser = e
    )
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
