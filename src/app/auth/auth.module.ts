import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthPageRoutingModule } from './auth-routing.module';

import { AuthPage } from './auth.page';
import { AmplifyAngularModule, AmplifyIonicModule, AmplifyService } from 'aws-amplify-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthPageRoutingModule,
    AmplifyAngularModule,
    AmplifyIonicModule,
  ],
  declarations: [AuthPage],
  providers: [AmplifyService]
})
export class AuthPageModule {}
