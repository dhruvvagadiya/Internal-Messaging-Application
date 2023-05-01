import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminProfileDTO } from 'src/app/core/models/user/AdminProfileDTO';
import { DesignationModel } from 'src/app/core/models/user/designation';
import { AdminService } from 'src/app/core/service/admin-service';
import { UserService } from 'src/app/core/service/user-service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-edit-employee-modal',
    templateUrl: 'edit-employee.component.html'
})

export class EditEmployeeModal implements OnInit {
    constructor(private adminService : AdminService,
        private userService : UserService) { }

    @Input() Employee : AdminProfileDTO
    @Input() modal
    @Input() designationList : DesignationModel [] = [];
    @Output() onEmployeeUpdate = new EventEmitter<AdminProfileDTO>();

    editEmployeeForm : FormGroup

    ngOnInit() {
        this.editEmployeeForm = new FormGroup({
            'fName' : new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            'lName' : new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            'email' : new FormControl(null, [Validators.required, Validators.email]),
            'designation' : new FormControl(null, [Validators.required])
        });  
    }


    editEmployeeDetails(){
        this.adminService.UpdateEmployee(this.Employee).subscribe((res : AdminProfileDTO) => {
            this.onEmployeeUpdate.emit(res);
        },
        err => {
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

    GetProfileUrl(url : string){
        return this.userService.getProfileUrl(url);
    }
}