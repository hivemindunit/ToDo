import {Component, QueryList, ViewChildren} from '@angular/core';

import {Platform, IonRouterOutlet, ModalController, MenuController, ActionSheetController, PopoverController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Router} from '@angular/router';
import {ToastController} from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import {environment} from '../environments/environment';
import {cfaSignIn} from 'capacitor-firebase-auth';
import {User} from './shared/user';
import {auth} from 'firebase';

const { AdMob } = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    // set up hardware back button event.
    lastTimeBackPress = 0;
    timePeriodToExit = 2000;

    @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public modalCtrl: ModalController,
        private menu: MenuController,
        private actionSheetCtrl: ActionSheetController,
        private popoverCtrl: PopoverController,
        private router: Router,
        private toast: ToastController) {
        this.initializeApp();
        // Initialize BackButton Eevent.
        this.platform.backButton.subscribeWithPriority(10, () => {
            console.log('Handler was called!');
        });
        this.backButtonEvent();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
        if (this.platform.is('android') || this.platform.is('ios')) {
            AdMob.initialize(environment.androidAppId);
        }
    }

    // active hardware back button
    backButtonEvent() {
        this.platform.backButton.subscribe(async () => {
            // close action sheet
            try {
                const element = await this.actionSheetCtrl.getTop();
                if (element) {
                    element.dismiss();
                    return;
                }
            } catch (error) {
            }

            // close popover
            try {
                const element = await this.popoverCtrl.getTop();
                if (element) {
                    element.dismiss();
                    return;
                }
            } catch (error) {
            }

            // close modal
            try {
                const element = await this.modalCtrl.getTop();
                if (element) {
                    element.dismiss();
                    return;
                }
            } catch (error) {
                console.log(error);
            }

            // close side menu
            try {
                const element = await this.menu.getOpen();
                if (element) {
                    this.menu.close();
                    return;
                }
            } catch (error) {
            }

            this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
                if (outlet && outlet.canGoBack()) {
                    outlet.pop();

                } else if (this.router.url === '/home') {
                    if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
                        // this.platform.exitApp(); // Exit from app
                        navigator['app'].exitApp(); // work in ionic 4

                    } else {
                        // const toast = this.toast.create({
                        //   message: 'Press back again to exit App',
                        //   duration: 2000,
                        //   position: 'middle'});
                        // toast.present();
                        console.log('Press back again to exit App');
                        this.lastTimeBackPress = new Date().getTime();
                    }
                }
            });
        });
    }

    menuClose() {
        this.menu.close();
    }
}
