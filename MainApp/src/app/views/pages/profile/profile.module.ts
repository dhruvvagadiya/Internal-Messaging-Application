import { NgModule } from '@angular/core';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { CommonModule } from '@angular/common';
import { ChangePasswordModalComponent } from './change-password/change-password.component';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
    {
      path: '',
      redirectTo: 'detail',
      pathMatch: 'full',
    },
    {
      path: 'edit',
      component: ProfileEditComponent
    },
    {
      path: 'detail',
      component: ProfileDetailComponent
    }
  ]

@NgModule({
    imports: [ReactiveFormsModule, RouterModule.forChild(routes), CommonModule, NgSelectModule],
    exports: [],
    declarations: [ProfileEditComponent, ProfileDetailComponent, ChangePasswordModalComponent],
    providers: [],
})

export class ProfileModule { }
