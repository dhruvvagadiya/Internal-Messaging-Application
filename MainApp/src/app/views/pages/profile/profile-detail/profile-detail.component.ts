import { Component, OnInit } from "@angular/core";
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
  
export class ProfileDetailComponent implements OnInit {

  user : LoggedInUser;
  thumbnail : string =  "https://via.placeholder.com/30x30";

  constructor(private userService : UserService){
    // this.fetchUserDetails();
  }

  ngOnInit(): void {

    this.userService.getUserSubject().subscribe(e => {
      this.user = e;
      this.thumbnail = this.userService.getProfileUrl(e);
    });

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