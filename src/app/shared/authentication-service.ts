import { Injectable, NgZone } from '@angular/core';
import { auth } from 'firebase/app';
import { User } from './user';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';
import {environment} from '../../environments/environment';
import {cfaSignIn, cfaSignOut} from 'capacitor-firebase-auth';

@Injectable({
    providedIn: 'root'
})

export class AuthenticationService {
    userData: any;
    actionCodeSettings: any;

    constructor(
        public afStore: AngularFirestore,
        public ngFireAuth: AngularFireAuth,
        public router: Router,
        public ngZone: NgZone,
        public platform: Platform
    ) {
        this.actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be whitelisted in the Firebase Console.
            url: environment.appUrl + '/auth',
            // This must be true.
            handleCodeInApp: true,
            iOS: {
                bundleId: 'com.atsimbalistov.getitdone'
            },
            android: {
                packageName: 'com.atsimbalistov.getitdone',
                installApp: true,
                minimumVersion: '12'
            },
            dynamicLinkDomain: environment.dynamicLinkDomain
        };
        this.ngFireAuth.authState.subscribe(user => {
            // console.log('authState fired');
            // console.log(user);
            if (user) {
                this.userData = user;
                localStorage.setItem('user', JSON.stringify(this.userData));
                JSON.parse(localStorage.getItem('user'));
            } else {
                localStorage.setItem('user', null);
                JSON.parse(localStorage.getItem('user'));
            }
        });
    }

    // Login in with email/password
    SignIn(email, password) {
        return this.ngFireAuth.signInWithEmailAndPassword(email, password);
    }

    // Register user with email/password
    RegisterUser(email, password) {
        return this.ngFireAuth.createUserWithEmailAndPassword(email, password);
    }

    // Email verification when new user register
    async SendVerificationMail() {
        return this.ngFireAuth.authState.subscribe(
            (user) => user.sendEmailVerification());
                // .then(
                // () => console.log('email sent')));
        // return this.ngFireAuth.sendEmailVerification(this.actionCodeSettings);
            // .then(() => {
            //     this.router.navigate(['verify-email']);
            // });
    }

    // Recover password
    PasswordRecover(passwordResetEmail) {
        return this.ngFireAuth.sendPasswordResetEmail(passwordResetEmail, this.actionCodeSettings)
            .then(() => {
                // window.alert('Password reset email has been sent, please check your inbox.');
            }).catch((error) => {
                window.alert(error);
            });
    }

    // Returns true when user is logged in
    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return (user !== null && user.emailVerified !== false) ? true : false;
    }

    // Returns true when user's email is verified
    get isEmailVerified(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return (user.emailVerified !== false) ? true : false;
    }

    // Sign in with Gmail
    GoogleAuth() {
        if (this.platform.is('android') || this.platform.is('ios')) {
            cfaSignIn('google.com').subscribe(
                (user: User) => this.router.navigateByUrl('/')
            );
        } else {
            return this.AuthLogin(new auth.GoogleAuthProvider()).catch(function(error) {
                console.log(error.message);
            });
        }
    }

    // Auth providers
    AuthLogin(provider) {
        return this.ngFireAuth.signInWithPopup(provider)
            .then((result) => {
                this.ngZone.run(() => {
                    this.router.navigateByUrl('/');
                });
                this.SetUserData(result.user);
            }).catch((error) => {
                window.alert(error);
            });
    }

    // Store user in localStorage
    SetUserData(user) {
        const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
        const userData: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
        return userRef.set(userData, {
            merge: true
        });
    }

    // Sign-out
    SignOut() {
        if (this.platform.is('android') || this.platform.is('ios')) {
            cfaSignOut().subscribe();
        } else {
            return this.ngFireAuth.signOut().then(() => {
                localStorage.removeItem('user');
                this.router.navigate(['login']);
            });
        }

    }
}
