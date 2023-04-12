import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
export class ProfileEditComponent implements OnInit {

  loggedInUser: LoggedInUser
  profileEditForm : FormGroup
  thumbnail;
  file : File

  constructor(private authService : AuthService, private router : Router, private userService : UserService) { }

  ngOnInit(): void {

    this.userService.getUserSubject().subscribe(e => {
      this.loggedInUser = e;
      this.thumbnail = this.userService.getProfileUrl(e?.imageUrl);
    });

    this.loggedInUser = this.authService.getLoggedInUserInfo();

    this.profileEditForm = new FormGroup({
      'UserName' : new FormControl(this.loggedInUser.sub, [Validators.required]),
      'FirstName' : new FormControl(this.loggedInUser.firstName, [Validators.required]),
      'LastName' : new FormControl(this.loggedInUser.lastName, [Validators.required]),
      'Status' : new FormControl(this.loggedInUser.status, [Validators.required, Validators.maxLength(50)]),
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

      //show sample profile image on screen
      var reader = new FileReader();
        reader.onload = (e) => {
            this.thumbnail = e.target.result;
        };
      reader.readAsDataURL(this.file);

    }
  }

}
