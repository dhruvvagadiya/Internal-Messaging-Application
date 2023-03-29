import { Component, OnInit, ViewChild, ElementRef, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth-service';
import Swal from 'sweetalert2'
import { LoggedInUser } from 'src/app/core/models/loggedin-user';
import { AccountService } from 'src/app/core/service/account-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  loggedInUser: LoggedInUser
  thumbnail: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService,
    private accountService : AccountService,
  ) {

  }

  ngOnInit(): void {
    this.authService.user.subscribe(data => {
      this.loggedInUser = data;

      this.accountService.getImage().subscribe(
        (res : Blob) => {
          this.createImageFromBlob(res);
        }
      );
      
    });

    this.loggedInUser = this.authService.getLoggedInUserInfo();
    
    this.accountService.getImage().subscribe(
      (res : Blob) => {
        this.createImageFromBlob(res);
      }
    );
  }


  createImageFromBlob(res : Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
        this.thumbnail = reader.result;
    }, false);
  
    if (res) {
      reader.readAsDataURL(res);
    }
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

  }

}
