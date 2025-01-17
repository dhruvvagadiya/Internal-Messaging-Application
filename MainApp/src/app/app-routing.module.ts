import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseComponent } from './views/layout/base/base.component';
import { AuthGuard } from './core/guard/auth.guard';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';

const routes: Routes = [
  { path:'auth', loadChildren: () => import('./views/pages/auth/auth.module').then(m => m.AuthModule) },
  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'chat',
        loadChildren: () => import('./views/pages/chat/chat.module').then(m => m.ChatModule)
      },
      {
        path: 'group',
        loadChildren: () => import('./views/pages/group/group.module').then(m => m.GroupModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./views/pages/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./views/admin/admin.module').then(m => m.AdminModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
    ]
  },
  { 
    path: 'error',
    component: ErrorPageComponent,
    data: {
      'type': 404,
      'title': 'Page Not Found',
      'desc': 'Oopps!! The page you were looking for doesn\'t exist.'
    }
  },
  {
    path: 'error/:type',
    component: ErrorPageComponent
  },
  { path: '**', redirectTo: 'error', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
