import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { EditEmployeeModal } from './modals/edit-employee-modal/edit-employee.component';
import { AddEmployeeModal } from './modals/add-employee-modal/add-employee.component';
import { AdminGuard } from 'src/app/core/guard/admin.guard';

const routes: Routes = [
    {
      path: "",
      component: AdminComponent,
      canActivate : [AdminGuard]
    },
  ];


@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        TableModule,
        ReactiveFormsModule,
        NgSelectModule
    ],
    exports: [RouterModule],
    declarations: [AdminComponent, EditEmployeeModal, AddEmployeeModal],
    providers: [ AdminGuard ],
})
export class AdminModule { }
