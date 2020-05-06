import { Component, OnInit } from '@angular/core';
import {Auth, Hub} from 'aws-amplify';
import {Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';

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
  constructor(private router: Router, public loadingController: LoadingController, public formBuilder: FormBuilder) {
    Hub.listen('auth', (data) => {
      const {payload} = data;
      this.onAuthEvent(payload);
    });
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      phone: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
      password: ['', [Validators.required]],
      email: ['', [Validators.required]]
    });
    this.confirmForm = this.formBuilder.group({
      phone: ['', [Validators.required]], // Validators.pattern('^[0-9]+$')]],
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
      Auth.signUp({
        username: this.registerForm.value.phone,
        password: this.registerForm.value.password,
        attributes: {email: this.registerForm.value.email}
      }).then((result) => {
        loading.dismiss();
        this.validationError = null;
        this.codeSent = true;
        this.codeSentTo = result.codeDeliveryDetails.Destination;
        // @ts-ignore
        this.confirmForm.controls.phone.setValue(result.user.username);
        this.isSubmitted = false;
        // console.log(result);
      }).catch(error => {
        loading.dismiss();
        this.validationError = error.message;
      });
    }
  }

  async confirm() {
    this.isSubmitted = true;
    if (!this.confirmForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
      Auth.confirmSignUp(this.confirmForm.value.phone.toString(), this.confirmForm.value.code.toString()).then((result) => {
        this.validationError = null;
        // console.log(result);
        if (result === 'SUCCESS') {
          Auth.signIn(this.registerForm.value.phone.toString(), this.registerForm.value.password.toString()).then((result) => {
            this.validationError = null;
            loading.dismiss();
            this.router.navigateByUrl('/');
          }).catch(error => {
            loading.dismiss();
            this.validationError = error.message;
          });
        }
      }).catch(error => {
        loading.dismiss();
        this.validationError = error.message;
        // console.log(error);
      });
    }
  }

  async resendCode() {
    this.isSubmitted = true;
    if (!this.confirmForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
      Auth.resendSignUp(this.confirmForm.value.phone.toString()).then((result) => {
        loading.dismiss();
        this.validationError = null;
        // console.log(result);
      }).catch(error => {
        loading.dismiss();
        this.validationError = error.message;
        // console.log(error);
      });
    }
  }
}
