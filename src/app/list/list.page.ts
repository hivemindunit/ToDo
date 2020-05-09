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
// import * as moment from 'moment';

@Component({
    selector: 'app-list-page',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss']
})

export class ListPage implements OnInit, AfterContentInit {
    // momentjs: any = moment;
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

    compareItem(a, b) {
        const itemA = Date.parse(a.createdAt);
        const itemB = Date.parse(b.createdAt);

        let comparison = 0;
        if (itemA > itemB) {
            comparison = 1;
        } else if (itemA < itemB) {
            comparison = -1;
        }
        return comparison;
    }

    activeItems() {
        const items = this.itemList.items.filter(item => item.status !== 'archived');
        return items.sort(this.compareItem);
    }

    archivedItems() {
        return this.itemList.items.filter(item => item.status === 'archived');
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

    async modify(item) {
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
            if (typeof result.data !== 'undefined') {
                if (result.data.newItem) {
                    // ...and add a new item if modal passes back newItem
                    const newItem = new Todo({
                        title: result.data.newItem.title,
                        ...(typeof result.data.newItem.description === 'string' && {
                            description: result.data.newItem.description
                        }),
                        status: result.data.newItem.status
                    });
                    result.data.itemList.items.push(newItem);
                    DataStore.save(newItem);
                } else if (result.data.editItem) {
                    // ...or splice the items array if the modal passes back editItem
                    const editItem = result.data.editItem;
                    const i = this.itemList.items.findIndex(element => element.id === editItem.id);
                    result.data.itemList.items[i] = editItem;
                    DataStore.query(Todo, editItem.id).then(original => {
                        DataStore.save(
                            Todo.copyOf(original, updated => {
                                updated.title = editItem.title;
                                updated.description = editItem.description;
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

    async delete(id) {
        // const item = this.itemList.items[i];
        const i = this.itemList.items.findIndex(element => element.id === id);
        // const item = this.itemList.items[i];
        this.itemList.items.splice(i, 1);
        // const res = await DataStore.query(Todo, item.id);
        // await DataStore.delete(res);
        DataStore.query(Todo, id).then(original => {
            DataStore.save(
                Todo.copyOf(original, updated => {
                    updated.status = 'archived';
                    updated.archivedAt = Date.now().toString();
                })
            );
            // this.loadData();
        });
    }

    async toggleComplete(id) {
        const i = this.itemList.items.findIndex(element => element.id === id);
        const item = this.itemList.items[i];
        let targetState: string;
        let doneAt: string = item.doneAt;
        if (item.status === 'new') {
            targetState = 'complete';
            doneAt = Date.now().toString();
        } else {
            targetState = 'new';
        }
        DataStore.query(Todo, item.id).then(original => {
            DataStore.save(
                Todo.copyOf(original, updated => {
                    updated.status = targetState;
                    updated.doneAt = doneAt;
                })
            );
            this.loadData();
        });
    }

    signOut() {
        this.amplifyService.auth().signOut();
        this.router.navigate(['/auth']);
    }
}
