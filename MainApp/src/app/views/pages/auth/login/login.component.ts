import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginModel } from 'src/app/core/models/user/login-model';
import { AccountService } from 'src/app/core/service/account-service';
import { AuthService } from 'src/app/core/service/auth-service';
import { SignalrService } from 'src/app/core/service/signalR-service';
import { UserService } from 'src/app/core/service/user-service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  loginModel: LoginModel

  constructor(private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private authService: AuthService,
    private signalrService : SignalrService) { }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.loginModel = {
      emailAddress: '',
      password: '',
      userName: ''
    }
  }

  @ViewChild('loginForm') loginForm;

  onLoggedin(e) {
    e.preventDefault();
    // console.log(this.loginModel);
    // console.log(this.loginForm);

    // Implementation of API.
    this.accountService.login(this.loginModel).subscribe((result: any) => {
      this.authService.login(result.token, () => {
        Swal.fire({
          title: 'Success!',
          text: 'User loggedin successfully.',
          icon: 'success',
          timer: 1500,
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
        }, (1500));
        this.router.navigate([this.returnUrl]);
      });
    }, (err) => {
      Swal.fire({
        title: 'Error!',
        text: err.error.message,
        icon: 'error',
      });
    });

  }

}
