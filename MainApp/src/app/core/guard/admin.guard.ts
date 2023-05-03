import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { JwtHelper } from '../helper/jwt-helper';

@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private jwtHelper: JwtHelper, private router : Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (localStorage.getItem('isLoggedin')) {

            var token = this.jwtHelper.decodeToken(localStorage.getItem('USERTOKEN'));

            if(token.exp >= Date.now() / 1000 && (<string>token.designation).toLowerCase() !== 'probationer'){
              return true;
            }
        }
          
        this.router.navigate(['/dashboard']);
        return false;
    }
}