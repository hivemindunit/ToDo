import {Component, QueryList, ViewChildren} from '@angular/core';
import {Platform, IonRouterOutlet, ModalController, MenuController, ActionSheetController, PopoverController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
// import {Router} from '@angular/router';
import {ToastController} from '@ionic/angular';
import {Plugins} from '@capacitor/core';
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
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public modalCtrl: ModalController,
        private menu: MenuController,
        // private actionSheetCtrl: ActionSheetController,
        // private popoverCtrl: PopoverController,
        // private router: Router,
        public toastController: ToastController) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
        if (this.platform.is('android') || this.platform.is('ios')) {
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
