import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import {AmplifyAngularModule} from 'aws-amplify-angular';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RegisterPageRoutingModule,
        AmplifyAngularModule,
        ReactiveFormsModule
    ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}
