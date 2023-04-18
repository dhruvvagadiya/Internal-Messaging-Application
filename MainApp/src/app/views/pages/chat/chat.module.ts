import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgbDropdownModule, NgbTooltipModule, NgbNavModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PickerModule } from '@ctrl/ngx-emoji-mart';


import { ChatComponent } from "./chat.component";
import { ChatMessageComponent } from "./chat-message/chat-message.component";
import { ChatSideBarComponent } from "./chat-sidebar/chat-sidebar.component";
import { SharedModule } from "../../shared/shared.module";

const routes: Routes = [
    {
      path: '',
      component: ChatComponent,
      children : [
        {
          path : ':userName',
          component : ChatMessageComponent
        }
      ]
    },
  ]

@NgModule({
    declarations: [ChatComponent, ChatMessageComponent, ChatSideBarComponent],
    imports: [
      RouterModule.forChild(routes),
      NgbDropdownModule,
      NgbTooltipModule,
      NgbNavModule,
      NgbCollapseModule,
      PerfectScrollbarModule,
      PickerModule,
      SharedModule
    ],
    exports : [RouterModule]
  })

export class ChatModule {

}