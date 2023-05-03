import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminProfileDTO } from 'src/app/core/models/user/AdminProfileDTO';
import { DesignationModel } from 'src/app/core/models/user/designation';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AccountService } from 'src/app/core/service/account.service';
import { AdminService } from 'src/app/core/service/admin.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { UserService } from 'src/app/core/service/user.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-admin-component',
    templateUrl: 'admin.component.html',
    styleUrls : ['admin.component.scss']
})

export class AdminComponent implements OnInit {

    constructor(private adminService : AdminService, private authService : AuthService, private modalService: NgbModal, private accountService : AccountService, private userService : UserService) { }

    employees : AdminProfileDTO [] = [];
    isAdmin = false;

    Employee : AdminProfileDTO
    designationList : DesignationModel [] = [];

    user : LoggedInUser

    ngOnInit() {
        this.adminService.GetAll().subscribe(
            (e : AdminProfileDTO[] )=> {
                this.employees = e;
            }
        )

        this.userService.getUserSubject().subscribe(e => {
            if(e){
                this.user = e;
                this.isAdmin = this.user.designation === 'CEO' || this.user.designation === 'CTO';

                if(this.isAdmin){
                    this.accountService.getEmpDesignations().subscribe((e : DesignationModel []) => {
                        this.designationList = e;
                    }); 
                }
            }
        });
    }

    GetProfileUrl(url : string){
        return this.userService.getProfileUrl(url);
    }

    openBasicModal(content: TemplateRef<any>, employee : AdminProfileDTO) {
        this.Employee = {...employee};

        this.Employee.designationId = this.designationList.find(e => e.role.toLowerCase() === employee.designation.toLowerCase())?.id

        this.modalService.open(content, {centered : true, windowClass : "employeeEditModal"}).result.then((result) => {}).catch((err) => {});
    }

    openAddModal(content: TemplateRef<any>) {
        this.modalService.open(content, {centered : true}).result.then((result) => {}).catch((err) => {});
    }

    deleteEmployee(username : string){
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.isConfirmed) {

                this.adminService.DeleteEmployee(username).subscribe(() => {
                    Swal.fire(
                        'Deleted!',
                        'Your file has been deleted.',
                        'success'
                    );

                    var tmp = this.employees.findIndex(e => e.userName === username);
                    if(tmp !== -1) this.employees.splice(tmp, 1);    
                },
                err => {
                    Swal.fire(
                        'Error!',
                        'Some error occured! Try again',
                        'error'
                    );
                })
            }
        })
    }

    editEmployee(event : AdminProfileDTO){
        var tmp = this.employees.findIndex(e => e.userName === event.userName);      
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        })

        if(tmp !== -1) {
            this.employees[tmp] = event;

            Toast.fire({
                icon: 'success',
                title: 'Details Updated Successfully'
            })
        }
        else{
            this.employees.push(event);

            Toast.fire({
                icon: 'success',
                title: 'Employee Created Successfully'
            })
        }
    }

    DoAllow(employee : AdminProfileDTO){        
        if(employee.designation === 'CEO') return false;
        if(this.user.designation === 'CTO' && employee.designation === 'CTO'){    //also not cto
            return false;
        }

        return true;
    }
}