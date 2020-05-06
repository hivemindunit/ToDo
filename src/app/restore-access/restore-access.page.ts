import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Auth} from 'aws-amplify';
import {Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';

@Component({
    selector: 'app-restore-access',
    templateUrl: './restore-access.page.html',
    styleUrls: ['./restore-access.page.scss'],
})
export class RestoreAccessPage implements OnInit {
    restoreAccessForm: FormGroup;
    verifyForm: FormGroup;
    isSubmitted = false;
    codeSent = false;
    validationError = false;
    username = '';

    constructor(private router: Router, public loadingController: LoadingController, public formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.restoreAccessForm = this.formBuilder.group({
            phone: ['', [Validators.required]] // Validators.pattern('^[0-9]+$')]],
        });
        this.verifyForm = this.formBuilder.group({
            phone: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
            code: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    get restoreAccessFormErrorControl() {
        return this.restoreAccessForm.controls;
    }

    get verifyFormErrorControl() {
        return this.verifyForm.controls;
    }

    async submit() {
        this.isSubmitted = true;
        if (!this.restoreAccessForm.valid) {
            return false;
        } else {
            const loading = await this.loadingController.create({
                message: 'Please wait...'
            });
            await loading.present();
            console.log(this.restoreAccessForm.value.phone);
            Auth.forgotPassword(this.restoreAccessForm.value.phone.toString()).then((result) => {
                console.log(result);
                loading.dismiss();
                this.validationError = null;
                this.codeSent = true;
                this.isSubmitted = false;
                this.verifyForm.controls.phone.setValue(this.restoreAccessForm.value.phone);
            }).catch(error => {
                this.isSubmitted = false;
                loading.dismiss();
                this.validationError = error.message;
            });
        }
    }

    async verify() {
        this.isSubmitted = true;
        if (!this.verifyForm.valid) {
            return false;
        } else {
            const loading = await this.loadingController.create({
                message: 'Please wait...'
            });
            await loading.present();
            Auth.forgotPasswordSubmit(
                this.verifyForm.value.phone.toString(),
                this.verifyForm.value.code.toString(),
                this.verifyForm.value.password.toString()).then((result) => {
                loading.dismiss();
                this.validationError = null;
                this.router.navigateByUrl('/auth');
            }).catch(error => {
                this.isSubmitted = false;
                loading.dismiss();
                this.validationError = error.message;
            });
        }
    }

    async resendCode() {
        this.isSubmitted = true;
        if (!this.restoreAccessForm.value.phone) {
            // @ts-ignore
            this.validationError = 'Phone is required';
            return false;
        } else {
            const loading = await this.loadingController.create({
                message: 'Please wait...'
            });
            await loading.present();
            Auth.resendSignUp(this.restoreAccessForm.value.phone.toString()).then((result) => {
                loading.dismiss();
                this.validationError = null;
                this.isSubmitted = false;
            }).catch(error => {
                this.isSubmitted = false;
                loading.dismiss();
                this.validationError = error.message;
            });
        }
    }
}
