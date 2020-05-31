import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {AuthenticationService} from '../shared/authentication-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  confirmForm: FormGroup;
  isSubmitted = false;
  validationError: string = null;
  codeSent = false;
  codeSentTo = '';
  // username: string;
  constructor(private router: Router,
              public loadingController: LoadingController,
              public formBuilder: FormBuilder,
              public authService: AuthenticationService) {
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
      password: ['', [Validators.required]],
    });
    this.confirmForm = this.formBuilder.group({
      email: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
      code: ['']
    });
  }

  get registerFormErrorControl() {
    return this.registerForm.controls;
  }

  get confirmFormErrorControl() {
    return this.confirmForm.controls;
  }

  onAuthEvent(payload) {
    if (payload.event === 'signIn') {
      this.router.navigateByUrl('/');
    }
  }

  async register() {
    this.isSubmitted = true;
    if (!this.registerForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
      this.authService.RegisterUser(this.registerForm.value.email.toString(),
          this.registerForm.value.password.toString())
          .then(res => {
            this.validationError = null;
            this.authService.SendVerificationMail();
            loading.dismiss();
            this.codeSentTo = this.registerForm.value.email.toString();
            this.codeSent = true;
          })
          .catch(error => {
            loading.dismiss();
            this.validationError = error.message;
            console.log(error);
      });
    }
  }

  async resendEmail() {
    this.isSubmitted = true;
    const loading = await this.loadingController.create({
          message: 'Please wait...'
        });
    await loading.present();
    this.authService.SendVerificationMail().then(res => {
      loading.dismiss();
    })
    .catch(error => {
        loading.dismiss();
        this.validationError = error.message;
        console.log(error);
    });
  }
}
