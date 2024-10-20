import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth.service';
import Swal from 'sweetalert2'
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { UserService } from 'src/app/core/service/user.service';
import { AccountService } from 'src/app/core/service/account.service';
import { SignalrService } from 'src/app/core/service/signalR.service';

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
    private signalrService : SignalrService,
  ) {

  }

  ngOnInit(): void {
    
    this.userService.getUserSubject().subscribe(e => {
      this.loggedInUser = e;
      this.thumbnail = this.userService.getProfileUrl(e?.imageUrl);
    });

    this.signalrService.hubConnection.on('deleteUser', ()=> this.onLogout());
    this.signalrService.hubConnection.on('updateDetails', (f) => {
      localStorage.setItem('USERTOKEN', f);
      this.userService.getCurrentUserDetails();
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
  onLogout(e?) {
    if(e){
      e.preventDefault();
    }

    this.userService.updateProfileStatus('offline').subscribe(e => {
      this.signalrService.updateProfileStatus('offline', this.loggedInUser.userName);
    });

    this.authService.logout(() => {
      Swal.fire({
        title: 'Success!',
        text: 'User has been logged out.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
      });

      //close hub connection with server
      this.signalrService.closeConnection(this.loggedInUser?.userName);

      setTimeout(() => {
        window.location.reload();
        this.router.navigate(['/auth/login']);
      }, 2000);

    });
  }

}
