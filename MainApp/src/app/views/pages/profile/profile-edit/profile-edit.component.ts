import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DesignationModel } from 'src/app/core/models/user/designation';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AccountService } from 'src/app/core/service/account.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { UserService } from 'src/app/core/service/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: "app-profile-edit",
  templateUrl: "./profile-edit.component.html",
  styleUrls: ["./profile-edit.component.scss"],
  preserveWhitespaces: true,
})
export class ProfileEditComponent implements OnInit {
  loggedInUser: LoggedInUser;
  profileEditForm: FormGroup;
  thumbnail;
  file: File;

  designationList : DesignationModel [] = [];
  curDesignation = 1;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private modalService : NgbModal,
    private accountService : AccountService
  ) {}

  ngOnInit(): void {
    this.userService.getUserSubject().subscribe((e) => {
      this.loggedInUser = e;
      this.thumbnail = this.userService.getProfileUrl(e?.imageUrl);
    });

    this.loggedInUser = this.authService.getLoggedInUserInfo();

    this.profileEditForm = new FormGroup({
      UserName: new FormControl(this.loggedInUser.sub, [Validators.required]),
      FirstName: new FormControl(this.loggedInUser.firstName, [
        Validators.required,
      ]),
      LastName: new FormControl(this.loggedInUser.lastName, [
        Validators.required,
      ]),
      Email: new FormControl(this.loggedInUser.email, [
        Validators.required,
        Validators.email,
      ]),
    });
  }

  UpdateProfile() {
    //formData obj that contains file to be uploaded
    const formData = new FormData();

    formData.append("File", this.file);

    //add each entry from current form to FormData
    for (const key of Object.keys(this.profileEditForm.value)) {
      const value = this.profileEditForm.value[key];
      formData.append(key, value);
    }

    this.userService
      .updateProfile(
        formData,
        this.loggedInUser.userName
          ? this.loggedInUser.userName
          : this.loggedInUser.sub
      )
      .subscribe(
        (result: any) => {
          this.authService.login(result.token, () => {

            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            })
            
            Toast.fire({
              icon: 'success',
              title: 'Details Updated Successfully'
            })

            this.userService.getCurrentUserDetails();

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

  openBasicModal(content: TemplateRef<any>) {
    this.modalService
      .open(content, {})
      .result.then((result) => {})
      .catch((err) => {});
  }
}
