import {Component, OnInit} from '@angular/core';
import {Hub, Auth} from 'aws-amplify';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController} from '@ionic/angular';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})

export class AuthPage implements OnInit {
    loginForm: FormGroup;
    validationError: string;
    isSubmitted = false;
    constructor(private router: Router, public loadingController: LoadingController, public formBuilder: FormBuilder) {
        this.validationError = null;
        Hub.listen('auth', (data) => {
            const {payload} = data;
            this.onAuthEvent(payload);
        });
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            phone: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
            password: ['', [Validators.required]]
        });
    }

    get errorControl() {
        return this.loginForm.controls;
    }

    onAuthEvent(payload) {
        if (payload.event === 'signIn') {
            this.router.navigateByUrl('/');
        }
    }

    async login() {
        this.isSubmitted = true;
        if (!this.loginForm.valid) {
            console.log('Please provide all the required values!');
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
}
