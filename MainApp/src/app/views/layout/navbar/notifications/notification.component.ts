import { Component, OnInit, TemplateRef } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Notification } from "src/app/core/models/notification/notification";
import { LoggedInUser } from "src/app/core/models/user/loggedin-user";
import { AuthService } from "src/app/core/service/auth-service";
import { NotificationService } from "src/app/core/service/notification-service";
import { SignalrService } from "src/app/core/service/signalR-service";
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: "app-notification-component",
  templateUrl: "notification.component.html",
  styleUrls : ["notification.component.scss"],
})

export class NotificationComponent implements OnInit {
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private signalrService: SignalrService,
    private modalService: NgbModal
  ) {}

  user: LoggedInUser;
  notificationList: Notification[] = [];

  ngOnInit() {
    this.user = this.authService.getLoggedInUserInfo();

    this.notificationService
      .GetNotifications(this.user.sub)
      .subscribe((e: Notification[]) => {
        this.notificationList = e;        
      });

    this.signalrService.hubConnection.on(
      "addNotification",
      (e: Notification) => {
        this.notificationList.unshift(e);
      }
    );
  }

  hasUnseen() {
    return this.notificationList.some((e) => e.isSeen == 0);
  }

  viewAll() {
    if (this.notificationList.length > 0) {

      this.notificationService.ViewAll(this.user.sub).subscribe((e) => {
        //make seen all not
        this.notificationList.forEach((element) => {
          element.isSeen = 1;
        });
      });
    }
  }

  markAsSeen(obj : Notification){

    if(obj.isSeen === 0){
      this.notificationService.MarkAsSeen(obj.id).subscribe((e) => {
        obj.isSeen = 1;
      });
    }
  }

  clearAll() {
    if (this.notificationList.length > 0) {
      this.notificationService.ClearAll(this.user.sub).subscribe((e) => {
        this.notificationList = [];
      });
    }
  }

  openDetailsModal(content: TemplateRef<any>){
    this.modalService.open(content, {centered: true, scrollable:true, windowClass : "myCustomModalClass"}).result.then((result) => {}).catch((err) => {});      
  }
}
