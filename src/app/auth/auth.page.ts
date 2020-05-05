import {Component, OnInit} from '@angular/core';
import {Hub, Auth} from 'aws-amplify';
import {Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {LoadingController} from '@ionic/angular';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
    validationError: string;
    constructor(private router: Router, public loadingController: LoadingController) {
        this.validationError = null;
        Hub.listen('auth', (data) => {
            const {payload} = data;
            this.onAuthEvent(payload);
        });
    }

    async ngOnInit() {
    }

    onAuthEvent(payload) {
        if (payload.event === 'signIn') {
            this.router.navigateByUrl('/');
        }
    }

    async login(form: NgForm) {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        await loading.present();
        Auth.signIn(form.controls.phone.value.toString(), form.controls.password.value.toString()).then((result) => {
            loading.dismiss();
            this.validationError = null;
        }).catch(error => {
            loading.dismiss();
            this.validationError = error.message;
        });
    }
}
