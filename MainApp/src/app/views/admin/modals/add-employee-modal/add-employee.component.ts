import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminProfileDTO } from 'src/app/core/models/user/AdminProfileDTO';
import { DesignationModel } from 'src/app/core/models/user/designation';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { RegistrationModel } from 'src/app/core/models/user/registration-model';
import { AccountService } from 'src/app/core/service/account.service';
import Swal from 'sweetalert2';

@Component({
  selector: "app-add-employee-modal",
  templateUrl: "add-employee.component.html",
})
export class AddEmployeeModal implements OnInit {
  constructor(private accountService: AccountService) {}

  @Input() modal;
  @Output() onEmployeeUpdate = new EventEmitter<AdminProfileDTO>();
  @Input() designationList: DesignationModel[];

  AddEmployeeForm: FormGroup;
  regModel: RegistrationModel;

  ngOnInit() {

    this.AddEmployeeForm = new FormGroup({
      fName: new FormControl(null, [Validators.required]),
      lName: new FormControl(null, [Validators.required]),
      username: new FormControl(null, [
        Validators.required,
        Validators.pattern("^[A-Za-z][A-Za-z0-9_]{6,20}$"),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      designation: new FormControl(3, [Validators.required])
    });

    this.regModel = {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      designationId: 3,
    };

  }

    AddEmployee() {

        this.regModel.password = this.regModel.email

        this.accountService.register(this.regModel)
        .subscribe((data: {token : string, user : LoggedInUser}) => {
          
          var temp : AdminProfileDTO = {
            userName : data.user.userName,
            imageUrl : data.user.imageUrl,
            firstName : data.user.firstName,
            lastName : data.user.lastName,
            designation : data.user.designation,
            email : data.user.email
          }

          this.onEmployeeUpdate.emit(temp);

        }),
        (err) => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          })

          Toast.fire({
            icon: 'error',
            title: 'Some error occured'
          })
      };
    }
}