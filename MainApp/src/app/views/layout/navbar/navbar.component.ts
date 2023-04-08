import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth-service';
import Swal from 'sweetalert2'
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { UserService } from 'src/app/core/service/user-service';
import { AccountService } from 'src/app/core/service/account-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  loggedInUser: LoggedInUser
  thumbnail: string = "https://via.placeholder.com/30x30";

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private authService: AuthService,
    private userService : UserService,
    private accoutService : AccountService
  ) {

  }

  ngOnInit(): void {
    
    this.userService.getUserSubject().subscribe(e => {
      this.loggedInUser = e;
      this.thumbnail = this.userService.getProfileUrl(e);
    });
  }

  /**
   * Sidebar toggle on hamburger button click
   */
  toggleSidebar(e) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  /**
   * Logout
   */
  onLogout(e) {
    e.preventDefault();

    this.accoutService.logout().subscribe(res => {
      this.authService.logout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'User has been logged out.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
        });
        this.router.navigate(['/auth/login']);
      });
    });
  }

}
