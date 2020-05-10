import {Component, OnInit} from '@angular/core';
import {Hub, Auth} from 'aws-amplify';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController} from '@ionic/angular';
import {AmplifyService} from 'aws-amplify-angular';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})

export class AuthPage implements OnInit {
    loginForm: FormGroup;
    validationError: string;
    userName: string;
    statusDefined = false;
    isSubmitted = false;
    amplifyService: AmplifyService;

    constructor(
        private router: Router,
        public loadingController: LoadingController,
        public formBuilder: FormBuilder,
        public amplify: AmplifyService) {
        this.validationError = null;
        this.amplifyService = amplify;
        Hub.listen('auth', (data) => {
            const {payload} = data;
            this.onAuthEvent(payload);
        });
    }

    async ngOnInit() {
        this.loginForm = this.formBuilder.group({
            phone: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
            password: ['', [Validators.required]]
        });
    }

    async ionViewWillEnter() {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        await loading.present();
        Auth.currentUserInfo()
            .then(info => {
                this.statusDefined = true;
                if (info !== null) {
                    this.userName = info.attributes.phone_number;
                }
                loading.dismiss();
            });
    }

    get errorControl() {
        return this.loginForm.controls;
    }

    onAuthEvent(payload) {
        if (payload.event === 'signIn') {
            this.router.navigateByUrl('/');
        } else if (payload.event === 'signOut') {
            this.userName = undefined;
            this.statusDefined = true;
        }
    }

    async login() {
        this.isSubmitted = true;
        if (!this.loginForm.valid) {
            // console.log('Please provide all the required values!');
            return false;
        } else {
            const loading = await this.loadingController.create({
                message: 'Please wait...'
            });
            await loading.present();
            Auth.signIn(this.loginForm.value.phone.toString(), this.loginForm.value.password.toString()).then((result) => {
                loading.dismiss();
                this.validationError = null;
            }).catch(error => {
                loading.dismiss();
                this.validationError = error.message;
            });
        }
    }

    signOut() {
        this.amplifyService.auth().signOut();
    }
}
