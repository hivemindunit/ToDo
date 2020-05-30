import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController} from '@ionic/angular';
import {AuthenticationService} from '../shared/authentication-service';

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
    username = '';

    constructor(
        public loadingController: LoadingController,
        public formBuilder: FormBuilder,
        public authService: AuthenticationService) {
    }

    ngOnInit() {
        this.restoreAccessForm = this.formBuilder.group({
            email: ['', [Validators.required]] // Validators.pattern('^[0-9]+$')]],
        });
        this.verifyForm = this.formBuilder.group({
            email: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
            code: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    get restoreAccessFormErrorControl() {
        return this.restoreAccessForm.controls;
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
            console.log(this.restoreAccessForm.value.email);
            this.authService.PasswordRecover(this.restoreAccessForm.value.email).then(res => {
                console.log(res);
                loading.dismiss();
                this.codeSent = true;
                this.isSubmitted = false;
            });
        }
    }
}
