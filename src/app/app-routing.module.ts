import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  // {
  //   path: 'list',
  //   loadChildren: () => import('./list/list.module').then( m => m.ListPageModule)
  // },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'restore-access',
    loadChildren: () => import('./restore-access/restore-access.module').then( m => m.RestoreAccessPageModule)
  },
  {
    path: 'archive',
    loadChildren: () => import('./archive/archive.module').then( m => m.ArchivePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
