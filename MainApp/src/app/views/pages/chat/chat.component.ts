import { Component, OnInit, AfterViewInit } from '@angular/core';

import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { UserService } from 'src/app/core/service/user.service';

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

    this.userService.getUserSubject().subscribe(e => {
      this.loggedInUser = e;
      this.thumbnail = this.userService.getProfileUrl(e?.imageUrl);
    });
  }

  ngAfterViewInit(): void {

    // Show chat-content when clicking on chat-item for tablet and mobile devices
    document.querySelectorAll('.chat-list .chat-item').forEach(item => {
      item.addEventListener('click', event => {
        document.querySelector('.chat-content').classList.toggle('show');
      })
    });

  }

}
