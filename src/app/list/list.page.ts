import {Component, OnInit, AfterContentInit, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ToDoList} from '../classes/item.class';
import {Events} from '../events.service';
import {ItemPage} from './item/item.page';
import {AuthGuard} from '../auth.guard';
import {AmplifyService} from 'aws-amplify-angular';
import {Router} from '@angular/router';
import {DataStore} from '@aws-amplify/datastore';
import {Todo} from '../../models';

@Component({
    selector: 'app-list-page',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss']
})

export class ListPage implements OnInit, AfterContentInit {
    modal: any;
    data: any;
    user: any;
    itemList: ToDoList;
    signedIn: boolean;

    authState: any;
    // including AuthGuardService here so that it's available to listen to auth events
    authService: AuthGuard;
    amplifyService: AmplifyService;

    constructor(public modalController: ModalController,
                public events: Events,
                public guard: AuthGuard,
                public amplify: AmplifyService,
                private router: Router) {
        this.authState = {loggedIn: false};
        this.authService = guard;
        this.amplifyService = amplify;
        // Listen for changes to the AuthState in order to change item list appropriately
        this.amplifyService.authStateChange$
            .subscribe(authState => {
                this.authState.loggedIn = authState.state === 'signedIn';
                this.events.publish('data:AuthState', this.authState);
            });
    }

    ngAfterContentInit() {
        this.events.publish('data:AuthState', this.authState);
    }

    async ngOnInit() {
        // this.getItems();
        // Use AWS Amplify to get user data when creating items
        this.user = await this.amplifyService.auth().currentUserInfo();
        if (this.user == null) {
            this.router.navigate(['/auth']);
        } else {
            await this.loadData();
        }
    }

    private async loadData() {
        const res = await DataStore.query(Todo);
        this.itemList = {
            userId: this.user.userId,
            // @ts-ignore
            // items: res.data.listTodos.items
            items: res
        };
    }

    async modify(item, i) {
        const props = {
            itemList: this.itemList,
            /*
              We pass in an item parameter only when the user clicks on an existing item
              and therefore populate an editItem value so that our modal knows this is an edit operation.
            */
            editItem: item || undefined
        };

        // Create the modal
        this.modal = await this.modalController.create({
            component: ItemPage,
            componentProps: props
        });
        this.modal.onDidDismiss().then((result) => {
            if (result !== null) {
                if (result.data.newItem) {
                    // ...and add a new item if modal passes back newItem
                    const newItem = new Todo({
                        title: result.data.newItem.title,
                        description: result.data.newItem.description,
                        status: result.data.newItem.status
                    });
                    result.data.itemList.items.push(newItem);
                    DataStore.save(newItem);
                } else if (result.data.editItem) {
                    // ...or splice the items array if the modal passes back editItem
                    result.data.itemList.items[i] = result.data.editItem;
                    // tslint:disable-next-line:no-shadowed-variable
                    const item = result.data.editItem;
                    DataStore.query(Todo, item.id).then(original => {
                        DataStore.save(
                            Todo.copyOf(original, updated => {
                                updated.title = item.title;
                                updated.description = item.description;
                            })
                        );
                    });
                }
                this.modal.dismiss({
                    dismissed: true
                });
            }
        });
        return this.modal.present();
    }

    async delete(i) {
        const item = this.itemList.items[i];
        this.itemList.items.splice(i, 1);
        const res = await DataStore.query(Todo, item.id);
        await DataStore.delete(res);
    }

    async complete(i) {
        const item = this.itemList.items[i];
        DataStore.query(Todo, item.id).then(original => {
            DataStore.save(
                Todo.copyOf(original, updated => {
                    updated.status = 'complete';
                })
            );
            this.loadData();
        });
    }

    signOut() {
        this.amplifyService.auth().signOut();
        this.router.navigate(['/auth']);
    }

    // toggleDarkMode() {
    //     console.log('dark!');
    //     document.body.classList.toggle('dark');
    // }
}
