import { Component, OnInit } from '@angular/core';
import {Auth, Hub} from 'aws-amplify';
import {Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  validationError: string = null;
  codeSent = false;
  codeSentTo = '';
  username: string;
  constructor(private router: Router, public loadingController: LoadingController) {
    Hub.listen('auth', (data) => {
      const {payload} = data;
      this.onAuthEvent(payload);
    });
  }

  ngOnInit() {
  }

  onAuthEvent(payload) {
    if (payload.event === 'signIn') {
      this.router.navigateByUrl('/');
    }
  }

  async register(form: NgForm) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    Auth.signUp({
      username: form.controls.phone.value,
      password: form.controls.password.value,
      attributes: {email: form.controls.email.value}
    }).then((result) => {
      loading.dismiss();
      this.validationError = null;
      this.codeSent = true;
      this.codeSentTo = result.codeDeliveryDetails.Destination;
      this.username = result.user.username;
      // console.log(result);
    }).catch(error => {
      loading.dismiss();
      this.validationError = error.message;
    });
  }

  async confirm(form: NgForm) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    Auth.confirmSignUp(form.controls.phone.value.toString(), form.controls.code.value.toString()).then((result) => {
      loading.dismiss();
      this.validationError = null;
      // console.log(result);
      if (result === 'SUCCESS') {
        this.router.navigateByUrl('/');
      }
    }).catch(error => {
      loading.dismiss();
      this.validationError = error.message;
      // console.log(error);
    });
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
}
