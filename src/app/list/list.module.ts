import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ListPage } from './list.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { ListPageRoutingModule } from './list-routing.module';
import { ItemPage } from './item/item.page';
import { AmplifyAngularModule, AmplifyIonicModule, AmplifyService } from 'aws-amplify-angular';
import {ItemPageModule} from './item/item.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ExploreContainerComponentModule,
        ListPageRoutingModule,
        AmplifyAngularModule,
        AmplifyIonicModule,
        ReactiveFormsModule,
        ItemPageModule
    ],
  declarations: [ListPage],
  entryComponents: [
    ListPage,
    ItemPage
  ],
  providers: [AmplifyService]
})
export class ListPageModule {}
