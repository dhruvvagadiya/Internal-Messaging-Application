import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalrService } from './core/service/signalR.service';
import { AuthService } from './core/service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy  {
  title = 'nobleui-angular';


  constructor(private signalrService : SignalrService, private authService : AuthService) {    
  }

  ngOnInit(): void {

    let user = this.authService.getLoggedInUserInfo();
    
    if(user?.sub && user.exp >= Date.now() / 1000){      
      //start connection with hub  (will end on logout)
      this.signalrService.startConnection(user.sub);
    }
  }

  ngOnDestroy(): void {
  }
}
