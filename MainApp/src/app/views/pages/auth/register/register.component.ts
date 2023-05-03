import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DesignationModel } from 'src/app/core/models/user/designation';
import { RegistrationModel } from 'src/app/core/models/user/registration-model';
import { AccountService } from 'src/app/core/service/account.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { SignalrService } from 'src/app/core/service/signalR.service';
import { UserService } from 'src/app/core/service/user.service';
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
  designationList : DesignationModel [] = [];
  
  constructor(private router: Router, 
    private accountService: AccountService,
    private authService: AuthService,
    private userService : UserService,
    private signalrService : SignalrService) { }

  ngOnInit(): void {
    this.regModel = {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      designationId : 3
    }

    this.signupForm = new FormGroup({
      'fName' : new FormControl(null, [Validators.required]),
      'lName' : new FormControl(null, [Validators.required]),
      'username' : new FormControl(null, [Validators.required, Validators.pattern("^[A-Za-z][A-Za-z0-9_]{6,20}$")]),
      'email' : new FormControl(null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      'designation' : new FormControl(3, [Validators.required]),
      'password' : new FormControl(null, [Validators.required, Validators.minLength(8)])
    });

    this.accountService.getDesignations().subscribe((e : DesignationModel []) => {
      this.designationList = e;
    })

  }

  onRegister(e) {
    e.preventDefault();
    
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

          let user = this.authService.getLoggedInUserInfo();
    
          if(user?.sub){  
            //start connection with hub  (will end on logout)
            this.signalrService.startConnection(user.sub);
          }

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
