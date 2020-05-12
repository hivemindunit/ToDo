import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {
  quitOnBackButton = false;
  closeApp() {
    (navigator as any).app.exitApp();
  }
}
