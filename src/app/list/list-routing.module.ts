import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPage } from './list.page';

const routes: Routes = [
  {
    path: '',
    component: ListPage,
  },
  {
    path: 'item',
    loadChildren: () => import('./item/item.module').then( m => m.ItemPageModule)
  },
  {
    path: 'archive',
    loadChildren: () => import('../archive/archive.module').then( m => m.ArchivePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListPageRoutingModule {}
