import {Component, HostListener} from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {BackButtonService} from './back-button.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  @HostListener('document:backbutton')
  backButtonService: BackButtonService;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Handler was called!');
    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  onBackButton() {
    if (this.backButtonService.quitOnBackButton) {
      this.backButtonService.closeApp();
    } else {
      this.navCtrl.back();
    }
  }
}
