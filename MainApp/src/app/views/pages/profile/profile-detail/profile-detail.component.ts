import { Component, OnInit } from "@angular/core";
import { LoggedInUser } from "src/app/core/models/loggedin-user";
import { AuthService } from "src/app/core/service/auth-service";
import { UserService } from "src/app/core/service/user-service";
import { environment } from "src/environments/environment";

@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.scss'],
    preserveWhitespaces: true
  })
  
export class ProfileDetailComponent implements OnInit {

  user : LoggedInUser;
  thumbnail : string;

  constructor(private userService : UserService, private authService : AuthService){
    // this.fetchUserDetails();
  }

  ngOnInit(): void {

    this.userService.user.subscribe((e) => {
      this.user = e;

      if (e != null && this.user.imageUrl) {
        this.thumbnail = this.userService.getProfileUrl(e);
      }
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