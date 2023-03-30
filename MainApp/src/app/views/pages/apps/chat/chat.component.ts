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
  timeOutId;
  userMatched = [];
  openMenu = false;

  constructor(
    private accountService : AccountService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {

    //changed user on update
    this.authService.user.subscribe(data => {
      this.loggedInUser = data;

      //change profile image also
      this.accountService.getImage().subscribe(
        (res : Blob) => {
          this.createImageFromBlob(res);
        }
      );
      
    });
    
    //get initial values
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
      this.accountService.getUsers(event.target.value).subscribe(
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

  //generate image from response
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
