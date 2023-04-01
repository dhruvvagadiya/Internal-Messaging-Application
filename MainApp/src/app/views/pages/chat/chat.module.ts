import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClickOutsideDirective } from "src/app/core/Directives/click-outside.directive";
import { NgbDropdownModule, NgbTooltipModule, NgbNavModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { ChatComponent } from "./chat.component";
import { ChatMessageComponent } from "./chat-message/chat-message.component";
import { ChatSideBarComponent } from "./chat-sidebar/chat-sidebar.component";

const routes: Routes = [
    {
      path: '',
      component: ChatComponent
    }
  ]

@NgModule({
    declarations: [ChatComponent, ClickOutsideDirective, ChatMessageComponent, ChatSideBarComponent],
    imports: [
      RouterModule.forChild(routes),
      NgbDropdownModule,
      NgbTooltipModule,
      NgbNavModule,
      NgbCollapseModule,
      PerfectScrollbarModule
    ]
  })

export class ChatModule {

}