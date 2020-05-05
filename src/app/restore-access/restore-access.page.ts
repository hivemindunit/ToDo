import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Auth} from 'aws-amplify';
import {Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';

@Component({
    selector: 'app-restore-access',
    templateUrl: './restore-access.page.html',
    styleUrls: ['./restore-access.page.scss'],
})
export class RestoreAccessPage implements OnInit {
    codeSent = false;
    validationError = false;
    username = '';

    constructor(private router: Router, public loadingController: LoadingController) {
    }

    ngOnInit() {
    }

    async resendCode() {
        console.log(this.username);
        if (this.username) {
            const loading = await this.loadingController.create({
                message: 'Please wait...'
            });
            await loading.present();
            Auth.resendSignUp(this.username.toString()).then((result) => {
                loading.dismiss();
                this.validationError = null;
                // console.log(result);
            }).catch(error => {
                loading.dismiss();
                this.validationError = error.message;
                // console.log(error);
            });
        } else {
            this.validationError = 'Phone number can not be empty';
        }
    }

    async submit(form: NgForm) {
        console.log(form.controls.phone.value.toString());
        if (form.controls.phone.value) {
            const loading = await this.loadingController.create({
                message: 'Please wait...'
            });
            await loading.present();
            Auth.forgotPassword(form.controls.phone.value.toString()).then((result) => {
                loading.dismiss();
                this.validationError = null;
                this.codeSent = true;
                // console.log(result);
            }).catch(error => {
                loading.dismiss();
                this.validationError = error.message;
                // console.log(error);
            });
        } else {
            this.validationError = 'Phone number can not be empty';
        }
    }

    async verify(form: NgForm) {
        console.log(form.controls);
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        await loading.present();
        Auth.forgotPasswordSubmit(
            form.controls.phone.value.toString(),
            form.controls.code.value.toString(),
            form.controls.password.value.toString()).then((result) => {
            loading.dismiss();
            this.validationError = null;
            // console.log(result);
            this.router.navigateByUrl('/auth');
        }).catch(error => {
            loading.dismiss();
            this.validationError = error.message;
            // console.log(error);
        });
    }
}
