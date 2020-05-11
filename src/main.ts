import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import Amplify, { DataStore } from 'aws-amplify';
import API from '@aws-amplify/api';
import awsmobile from './aws-exports.js';

Amplify.configure(awsmobile);
API.configure(awsmobile);
DataStore.configure();

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
