import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { AuthService } from "src/app/core/service/auth-service";
import { UserService } from "src/app/core/service/user-service";

@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.scss'],
    preserveWhitespaces: true
  })
  
export class ProfileDetailComponent implements OnInit, OnDestroy {

  user : LoggedInUser;
  thumbnail : string;
  subscription : Subscription

  constructor(private userService : UserService, private authService : AuthService){
    // this.fetchUserDetails();
  }

  ngOnInit(): void {

    this.subscription = this.userService.user.subscribe((e) => {
      this.user = e;
      
      if (e != null && this.user.imageUrl) {
        this.thumbnail = this.userService.getProfileUrl(e);
      }
    });

    this.user = this.authService.getLoggedInUserInfo();

    this.userService.getLoggedInUser().subscribe(
      e => this.user = e
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // private fetchUserDetails() {
  //   this.userService.getLoggedInUser().subscribe((result) => {
  //     this.user = result;
  //     // console.log(result);
  //   },
  //   (err) => {
  //     console.log(err);
  //   });
  // }
}