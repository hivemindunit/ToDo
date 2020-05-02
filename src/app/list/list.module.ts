import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListPage } from './list.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ListPageRoutingModule } from './list-routing.module';
import { ItemPage } from './item/item.page';
import { AmplifyAngularModule, AmplifyIonicModule, AmplifyService } from 'aws-amplify-angular';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ListPageRoutingModule,
    AmplifyAngularModule,
    AmplifyIonicModule
  ],
  declarations: [ListPage, ItemPage],
  entryComponents: [
    ListPage,
    ItemPage
  ],
  providers: [AmplifyService]
})
export class ListPageModule {}
