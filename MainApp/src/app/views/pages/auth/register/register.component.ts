import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationModel } from 'src/app/core/models/user/registration-model';
import { AccountService } from 'src/app/core/service/account-service';
import { AuthService } from 'src/app/core/service/auth-service';
import { UserService } from 'src/app/core/service/user-service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  regModel: RegistrationModel;
  disableRegButtton: boolean = false;
  signupForm : FormGroup

  constructor(private router: Router, 
    private accountService: AccountService,
    private authService: AuthService,
    private userService : UserService) { }

  ngOnInit(): void {
    this.regModel = {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
    }

    this.signupForm = new FormGroup({
      'fName' : new FormControl(null, [Validators.required]),
      'lName' : new FormControl(null, [Validators.required]),
      'username' : new FormControl(null, [Validators.required]),
      'email' : new FormControl(null, [Validators.required, Validators.email]),
      'password' : new FormControl(null, [Validators.required, Validators.minLength(8)])
    });

  }

  onRegister(e) {
    e.preventDefault();
    // console.log(this.regModel);
    
    this.disableRegButtton = true; 
    this.accountService.register(this.regModel)
      .subscribe((data: any) => {
        this.authService.login(data.token, ()=>{
          Swal.fire({
            title: 'Success!',
            text: 'User has been registered.',
            icon: 'success',
            timer: 2000,
           timerProgressBar: true,
          });

          //get new user
          this.userService.getCurrentUserDetails();

          setTimeout(() => {
            this.router.navigate(["/"]);
            this.disableRegButtton = false; 

          }, (3000));
        })

      }, (err) => {
        this.disableRegButtton = false; 
        Swal.fire({
          title: 'Error!',
          text: err.error.message,
          icon: 'error',
        });
      });

  }

}
