import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginModel } from 'src/app/core/models/user/login-model';
import { AccountService } from 'src/app/core/service/account.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { SignalrService } from 'src/app/core/service/signalR.service';
import { UserService } from 'src/app/core/service/user.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  loginModel: LoginModel

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  })

  constructor(private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private authService: AuthService,
    private socialAuthService : SocialAuthService,
    private signalrService : SignalrService) { }    

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.loginModel = {
      emailAddress: '',
      password: '',
      userName: ''
    }

    this.socialAuthService.authState.subscribe((user) => {
      this.accountService.googleLogin(user.idToken).subscribe((result : any) => {
        this.updateUser(result);
      }, (err) => {        
        this.Toast.fire({
          icon: 'error',
          title : err.error.message ? err.error.message : "User is not registered!"
        })
      })
    });

  }

  @ViewChild('loginForm') loginForm;

  onLoggedin(e) {
    e.preventDefault();

    // Implementation of API.
    this.accountService.login(this.loginModel).subscribe((result: any) => {
      this.updateUser(result);
    }, (err) => {
      
      this.Toast.fire({
        icon: 'error',
        title : err.error.message ? err.error.message : "User is not registered!"
      })
    });

  }

  updateUser(result){
    this.authService.login(result.token, () => {

      this.Toast.fire({
        icon: 'success',
        title: 'Logged In Successfully'
      })

      //get new user
      this.userService.getCurrentUserDetails();

      let user = this.authService.getLoggedInUserInfo();
  
      if(user?.sub){  
        //start connection with hub  (will end on logout)
        this.signalrService.startConnection(user.sub);
      }
      setTimeout(() => {
        this.router.navigate([this.returnUrl]);
      }, 1500);
    });
  }
}
