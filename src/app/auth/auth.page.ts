import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController} from '@ionic/angular';
import {AuthenticationService} from '../shared/authentication-service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})

export class AuthPage implements OnInit {
    loginForm: FormGroup;
    validationError: string;
    isSubmitted = false;

    constructor(
        private router: Router,
        public loadingController: LoadingController,
        public formBuilder: FormBuilder,
        public authService: AuthenticationService) {
        this.validationError = null;
    }

    async ngOnInit() {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
            password: ['', [Validators.required]]
        });
    }

    get errorControl() {
        return this.loginForm.controls;
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
            this.authService.SignIn(this.loginForm.value.email.toString(), this.loginForm.value.password.toString())
                .then((res) => {
                    console.log(res);
                    if (res.user.emailVerified) {
                        loading.dismiss();
                        this.validationError = null;
                        this.router.navigateByUrl('/');
                    } else {
                        loading.dismiss();
                        this.validationError = 'Email is not verified';
                        return false;
                    }
                }).catch((error) => {
                loading.dismiss();
                this.validationError = error.message;
            });
        }
    }

    signOut() {
        this.authService.SignOut().then(res => {
            this.router.navigateByUrl('/auth');
        });
    }
}
