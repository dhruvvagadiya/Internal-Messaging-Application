import { Component, OnDestroy, OnInit } from '@angular/core';
import { SignalrService } from './core/service/signalR-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'nobleui-angular';

  constructor(private signalrService : SignalrService) {    
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
