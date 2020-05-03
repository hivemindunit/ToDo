import { Component, OnInit } from '@angular/core';
import { Hub } from 'aws-amplify';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  constructor(private router: Router) {
    Hub.listen('auth', (data) => {
      const { payload } = data;
      this.onAuthEvent(payload);
    });
  }

  ngOnInit() {
  }

  onAuthEvent(payload) {
    console.log(payload);
    if (payload.event === 'signIn') {
      this.router.navigateByUrl('/');
    }
  }
}
