import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { AccountService } from 'src/app/core/service/account.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { SignalrService } from 'src/app/core/service/signalR.service';
import { UserService } from 'src/app/core/service/user.service';
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

    Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    })

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
            'currentPassword': new FormControl(null, []),
            'password' : new FormControl(null, [Validators.required, Validators.minLength(8)]),
            'confirmPassword' : new FormControl(null, [Validators.required, Validators.minLength(8)]),
        },
        {
            validators : [this.passwordMatcher, this.passwordChecker]
        }
        );
    }

    changePassword(){
        this.accountService.changePassword(this.changePasswordModel).subscribe(e => {
            this.Toast.fire({
                icon: 'success',
                title: 'Password changed successfully'
            })
            this.modal.close();

        this.authService.logout(() => {
            //close hub connection with server
            this.signalrService.closeConnection(this.user.userName);

            this.router.navigate(['/auth/login']);
        });
        
        this.userService.getCurrentUserDetails();
        },
        err => {
            this.Toast.fire({
                icon: 'error',
                title: 'Invalid Credentials'
            })

            this.changePasswordForm.reset();
        })
    }

    passwordMatcher: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');      
        return password.value !== confirmPassword.value ? { 'passwordMatched': true } : null;
    };

    passwordChecker : ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('currentPassword');  
        //not google user and password is not entered then error        
        return !this.user.isGoogleUser && !password.value ? {'passwordRequired' : true} : null;
    };
}