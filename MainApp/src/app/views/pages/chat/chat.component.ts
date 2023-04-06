import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AuthService } from 'src/app/core/service/auth-service';
import { UserService } from 'src/app/core/service/user-service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {

  loggedInUser: LoggedInUser
  thumbnail = "https://via.placeholder.com/80x80";
  subscription : Subscription

  constructor(private userService : UserService, private authService : AuthService) { }

  ngOnInit(): void {

    this.subscription = this.userService.user.subscribe(e => {
      this.loggedInUser = e;

      if(e != null && this.loggedInUser.imageUrl) {
        this.thumbnail = this.userService.getProfileUrl(e);
      }
    });

    this.loggedInUser = this.authService.getLoggedInUserInfo();

    this.userService.getLoggedInUser().subscribe(
      e => this.loggedInUser = e
    );

  }

  ngAfterViewInit(): void {

    // Show chat-content when clicking on chat-item for tablet and mobile devices
    document.querySelectorAll('.chat-list .chat-item').forEach(item => {
      item.addEventListener('click', event => {
        document.querySelector('.chat-content').classList.toggle('show');
      })
    });

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // back to chat-list for tablet and mobile devices
  backToChatList() {
    document.querySelector('.chat-content').classList.toggle('show');
  }

  save() {
    console.log('passs');
  }

}
