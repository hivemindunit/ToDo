import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RestoreAccessPageRoutingModule } from './restore-access-routing.module';

import { RestoreAccessPage } from './restore-access.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RestoreAccessPageRoutingModule
  ],
  declarations: [RestoreAccessPage]
})
export class RestoreAccessPageModule {}
