import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RestoreAccessPage } from './restore-access.page';

const routes: Routes = [
  {
    path: '',
    component: RestoreAccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestoreAccessPageRoutingModule {}
