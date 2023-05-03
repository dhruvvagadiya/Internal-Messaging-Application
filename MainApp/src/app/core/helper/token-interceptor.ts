import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
@Injectable()

/**
 * attaches X-XSRF-TOKEN to every backend api request
 * token used to prevent api call from postman or other related softwares
 */

export class TokenInterceptor implements HttpInterceptor {
  token: any;
  constructor(
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.token = this.authService.getUserToken();
    if (this.token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', "bearer "+ this.token)
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
