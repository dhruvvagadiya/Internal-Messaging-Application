import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginModel } from 'src/app/core/models/login-model';
import { AccountService } from 'src/app/core/service/account-service';
import { AuthService } from 'src/app/core/service/auth-service';
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
    private authService: AuthService) { }

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
          timer: 2000,
         timerProgressBar: true,
        });
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, (2000));
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
