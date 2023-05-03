import { Component, OnInit } from "@angular/core";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { UserService } from "src/app/core/service/user.service";

@Component({
    selector: 'app-profile-detail',
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.scss'],
    preserveWhitespaces: true
  })
  
export class ProfileDetailComponent implements OnInit {

  user : LoggedInUser;
  thumbnail : string;

  constructor(private userService : UserService){
  }

  ngOnInit(): void {

    this.userService.getUserSubject().subscribe(e => {
      this.user = e;
      this.thumbnail = this.userService.getProfileUrl(e?.imageUrl);
    });

  }
}