import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {
  NgbDropdownModule,
  NgbTooltipModule,
  NgbNavModule,
  NgbCollapseModule,
} from "@ng-bootstrap/ng-bootstrap";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PickerModule } from "@ctrl/ngx-emoji-mart";

import { GroupComponent } from "./group.component";
import { GroupSideBarComponent } from "./group-sidebar/group-sidebar.component";
import { SharedModule } from "../../shared/shared.module";
import { GroupMessageHeaderComponent } from "./group-main/group-message-header/group-message-header.component";
import { GroupMessageBodyComponent } from "./group-main/group-message-body/group-message-body.component";
import { GroupMainComponent } from "./group-main/group-main.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { CreateGroupModalComponent } from "./modals/create-group/create-group.component";
import { UpdateGroupModalComponent } from "./modals/update-group/update-group.component";
import { AddMembersModal } from "./modals/add-members/add-members.component";
import { GroupMessageFooterComponent } from "./group-main/group-message-footer/group-message-footer.component";
import { LeaveGroupModalComponent } from "./modals/leave-group/leave-group.component";
import { RemoveUserModalComponent } from "./modals/remove-user/remove-user.component";

const routes: Routes = [
  {
    path: "",
    component: GroupComponent,
    children: [
      {
        path: ":userName",
        component: GroupMainComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    GroupComponent,
    GroupMainComponent,
    GroupSideBarComponent,
    GroupMessageHeaderComponent,
    GroupMessageBodyComponent,
    CreateGroupModalComponent,
    UpdateGroupModalComponent,
    AddMembersModal,
    LeaveGroupModalComponent,
    RemoveUserModalComponent,
    GroupMessageFooterComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    NgbDropdownModule,
    NgbTooltipModule,
    NgbNavModule,
    NgbCollapseModule,
    PerfectScrollbarModule,
    PickerModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  exports: [RouterModule],
})
export class GroupModule {}
