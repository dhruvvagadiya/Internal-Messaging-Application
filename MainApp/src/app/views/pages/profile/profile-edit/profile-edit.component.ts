import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AuthService } from 'src/app/core/service/auth-service';
import { UserService } from 'src/app/core/service/user-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  preserveWhitespaces: true
})
export class ProfileEditComponent implements OnInit, OnDestroy {

  loggedInUser: LoggedInUser
  profileEditForm : FormGroup
  file : File
  thumbnail : string
  subscription : Subscription

  constructor(private authService : AuthService, private router : Router, private userService : UserService) { }

  ngOnInit(): void {

    this.subscription = this.userService.user.subscribe((e) => {
      this.loggedInUser = e;

      if (e != null && this.loggedInUser.imageUrl) {
        this.thumbnail = this.userService.getProfileUrl(e);
      }
    });

    this.loggedInUser = this.authService.getLoggedInUserInfo();

    this.profileEditForm = new FormGroup({
      'FirstName' : new FormControl(this.loggedInUser.firstName, [Validators.required]),
      'LastName' : new FormControl(this.loggedInUser.lastName, [Validators.required]),
      'Email' : new FormControl(this.loggedInUser.email, [Validators.required, Validators.email])
    });
  }

  UpdateProfile(){

    //formData obj that contains file to be uploaded
    const formData = new FormData();

    formData.append('File', this.file);

    //add each entry from current form to FormData
    for (const key of Object.keys(this.profileEditForm.value)) {
      const value = this.profileEditForm.value[key];
      formData.append(key, value);
    }

    this.userService
      .updateProfile(formData, this.loggedInUser.userName ? this.loggedInUser.userName : this.loggedInUser.sub)
      .subscribe(
        (result: any) => {
          this.authService.login(result.token, () => {
            Swal.fire({
              title: "Success!",
              text: "Profile Updated Successfully.",
              icon: "success",
              timer: 1500,
              timerProgressBar: true,
            });

            this.userService.getCurrentUserDetails();
            
            setTimeout(() => {
              this.router.navigate(["/"]);
            }, 1500);

          });
        },
        (err) => {
          Swal.fire({
            title: "Error!",
            text: err.error.message,
            icon: "error",
          });
        }
      );
  }

  //add file to form at each change
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
