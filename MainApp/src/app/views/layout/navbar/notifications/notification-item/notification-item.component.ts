import { Component, Input, OnInit } from "@angular/core";
import { Notification } from "src/app/core/models/notification/notification";

@Component({
  selector: "app-notification-item-component",
  templateUrl: "notification-item.component.html",
  styleUrls : ["notification-item.component.scss"]
})
export class NotificationItemComponent implements OnInit {
  constructor(
  ) {}

  @Input() obj : Notification

  ngOnInit() {
  }
}
