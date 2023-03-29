import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoggedInUser } from 'src/app/core/models/loggedin-user';
import { AccountService } from 'src/app/core/service/account-service';
import { AuthService } from 'src/app/core/service/auth-service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {

  defaultNavActiveId = 1;
  loggedInUser: LoggedInUser
  thumbnail: any;

  constructor(
    private accountService : AccountService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.user.subscribe(data => {
      this.loggedInUser = data;

      this.accountService.getImage().subscribe(
        (res : Blob) => {
          this.createImageFromBlob(res);
        }
      );
      
    });
    
    this.loggedInUser = this.authService.getLoggedInUserInfo();
    
    this.accountService.getImage().subscribe(
      (res : Blob) => {
        this.createImageFromBlob(res);
      }
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


  createImageFromBlob(res : Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
        this.thumbnail = reader.result;
    }, false);
  
    if (res) {
      reader.readAsDataURL(res);
    }
  }

  // back to chat-list for tablet and mobile devices
  backToChatList() {
    document.querySelector('.chat-content').classList.toggle('show');
  }

  save() {
    console.log('passs');
  }

}
