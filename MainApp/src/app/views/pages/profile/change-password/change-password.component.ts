import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AccountService } from 'src/app/core/service/account-service';
import { AuthService } from 'src/app/core/service/auth-service';
import { SignalrService } from 'src/app/core/service/signalR-service';
import { UserService } from 'src/app/core/service/user-service';
import Swal from 'sweetalert2'


@Component({
    selector: 'app-change-password-modal',
    templateUrl: 'change-password.component.html'
})

export class ChangePasswordModalComponent implements OnInit {

    @Input() modal;
    user : LoggedInUser;
    changePasswordForm : FormGroup
    changePasswordModel;

    constructor(
        private userService : UserService,
        private accountService : AccountService,
        private signalrService : SignalrService,
        private authService : AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        this.userService.getUserSubject().subscribe((e) => {
            this.user = e;
        });

        this.changePasswordModel = {
            currentPassword: '',
            password: ''
        }
        
        this.changePasswordForm = new FormGroup({
            'currentPassword': new FormControl(null, [Validators.required]),
            'password' : new FormControl(null, [Validators.required, Validators.minLength(8)]),
            'confirmPassword' : new FormControl(null, [Validators.required, Validators.minLength(8)]),
        },
        {
            validators : this.passwordChecker
        }
        );
    }

    changePassword(){
        this.accountService.changePassword(this.changePasswordModel).subscribe(e => {
            Swal.fire({
                position: "top-right",
                icon: "success",
                title: "Passwords Changed Successfully",
                showConfirmButton: false,
                timer: 1000
            });
            this.modal.close();

            this.accountService.logout().subscribe(res => {
                this.authService.logout(() => {

                  //close hub connection with server
                  this.signalrService.closeConnection(this.user.userName);
          
                  this.router.navigate(['/auth/login']);
                });
            })
        },
        err => {
            Swal.fire({
                title: 'Error!',
                text: "Incorrect credentials provided",
                icon: 'error',
                timer: 1000
            });

            this.changePasswordForm.reset();
        })
    }

    passwordChecker: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');      
        return password.value !== confirmPassword.value ? { 'passwordMatched': true } : null;
    };
}