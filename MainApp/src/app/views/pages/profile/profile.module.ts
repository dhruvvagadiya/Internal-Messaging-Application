import { NgModule } from '@angular/core';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { CommonModule } from '@angular/common';

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
    imports: [ReactiveFormsModule, RouterModule.forChild(routes), CommonModule],
    exports: [],
    declarations: [ProfileEditComponent, ProfileDetailComponent],
    providers: [],
})

export class ProfileModule { }
