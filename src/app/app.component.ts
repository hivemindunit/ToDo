import {Component, QueryList, ViewChildren} from '@angular/core';
import {Platform, IonRouterOutlet, ModalController, MenuController, ActionSheetController, PopoverController} from '@ionic/angular';
import {ToastController} from '@ionic/angular';
import {Plugins, StatusBarStyle} from '@capacitor/core';
import {environment} from '../environments/environment';

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
        public modalCtrl: ModalController,
        private menu: MenuController,
        public toastController: ToastController) {
        this.initializeApp();
    }

    async initializeApp() {
        const {SplashScreen, StatusBar} = Plugins;
        if (this.platform.is('android') || this.platform.is('ios')) {
            await SplashScreen.hide();
            // await StatusBar.setStyle({ style: StatusBarStyle.Light });
            AdMob.initialize(environment.androidAppId);
            // Initialize BackButton Event.
            this.platform.backButton.subscribeWithPriority(10, () => {
                this.backButtonEvent();
            });
        }
    }

    // active hardware back button
    async backButtonEvent() {
        if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
            // this.platform.exitApp(); // Exit from app
            navigator['app'].exitApp(); // work in ionic 4
        } else {
            const toast = await this.toastController.create({
              message: 'Tap twice to exit',
              duration: this.timePeriodToExit,
              position: 'middle'});
            await toast.present();
            this.lastTimeBackPress = new Date().getTime();
        }
    }

    menuClose() {
        this.menu.close();
    }
}
