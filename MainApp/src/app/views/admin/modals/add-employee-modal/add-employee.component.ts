import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminProfileDTO } from 'src/app/core/models/user/AdminProfileDTO';
import { DesignationModel } from 'src/app/core/models/user/designation';
import { RegistrationModel } from 'src/app/core/models/user/registration-model';
import { AdminService } from 'src/app/core/service/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: "app-add-employee-modal",
  templateUrl: "add-employee.component.html",
})
export class AddEmployeeModal implements OnInit {
  constructor(private adminService: AdminService) {}

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
      email: new FormControl(null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
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

        this.adminService.CreateEmployee(this.regModel)
        .subscribe((res : AdminProfileDTO) => {
          this.onEmployeeUpdate.emit(res);
          this.modal.close();
        },     
        (e) => {
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
      })
    }
}