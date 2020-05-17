import {Component, OnInit, AfterContentInit, Input, ViewChild} from '@angular/core';
import {IonReorderGroup, ModalController} from '@ionic/angular';
import {ToDoList} from '../classes/item.class';
import {Events} from '../events.service';
import {ItemPage} from './item/item.page';
import {AuthGuard} from '../auth.guard';
import {AmplifyService} from 'aws-amplify-angular';
import {Router} from '@angular/router';
import {DataStore} from '@aws-amplify/datastore';
import {Todo} from '../../models';
import {Auth} from 'aws-amplify';

@Component({
    selector: 'app-list-page',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss']
})

export class ListPage implements OnInit, AfterContentInit {
    @ViewChild(IonReorderGroup, {static: true}) reorderGroup: IonReorderGroup;
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
        // this.amplifyService.authStateChange$
        //     .subscribe(authState => {
        //         this.authState.loggedIn = authState.state === 'signedIn';
        //         this.events.publish('data:AuthState', this.authState);
        //     });
    }

    compareItem(a, b) {
        const itemA = a.order; // Date.parse(a.createdAt);
        const itemB = b.order; // Date.parse(b.createdAt);

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

    async ngOnInit() {
    }

    ngAfterContentInit() {
        // this.events.publish('data:AuthState', this.authState);
        // const subscription = DataStore.observe(Todo, item => item.status('notContains', 'archived')).subscribe(msg => {
        //     // res = res.sort(this.compareItem);
        //     console.log(msg);
        // });
    }

    async ionViewWillEnter() {
        // Use AWS Amplify to get user data when creating items
        try {
            this.user = await Auth.currentAuthenticatedUser();
        } catch (err) {
            console.log(err);
            if (err === 'not authenticated') {
                await this.router.navigate(['/auth']);
            } else {
                console.log(err);
            }
        }
        // this.user = await this.amplifyService.auth().currentUserInfo();
        if (this.user == null) {
            await this.router.navigate(['/auth']);
        } else {
            await this.loadData();
        }
    }

    private async loadData() {
        DataStore.query(Todo, item => item.status('notContains', 'archived')).then(res => {
            res = res.sort(this.compareItem);
            this.itemList = {
                    userId: this.user.userId,
                    // @ts-ignore
                    // items: res.data.listTodos.items
                    items: res
                };
            }
        );
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
                    const items = result.data.itemList.items.filter(item => item.status !== 'archived');
                    // console.log(items);
                    let itemOrder;
                    if (items.length === 0) {
                        itemOrder = 0;
                    } else {
                        itemOrder = items[items.length - 1].order + 1;
                    }
                    // console.log(items.length);
                    const newItem = new Todo({
                        title: result.data.newItem.title,
                        ...(typeof result.data.newItem.description === 'string' && {
                            description: result.data.newItem.description
                        }),
                        status: result.data.newItem.status,
                        order: itemOrder
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
        const i = this.itemList.items.findIndex(element => element.id === id);
        this.itemList.items.splice(i, 1);
        DataStore.query(Todo, id).then(original => {
            DataStore.save(
                Todo.copyOf(original, updated => {
                    updated.status = 'archived';
                    updated.archivedAt = Date.now().toString();
                })
            );
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

    // doRefresh(event) {
    //     this.loadData().then(event.target.complete());
    // }

    async doReorder(ev: any) {
        // The `from` and `to` properties contain the index of the item
        // when the drag started and ended, respectively
        // console.log(ev);
        let fromIndex, toIndex;
        const items = this.itemList.items;
        // in some cases detail.from or detail.to exceeds array boundaries. The code below is to correct that
        if (ev.detail.from > items.length - 1) {
            fromIndex = items.length - 1;
        } else {
            fromIndex = ev.detail.from;
        }
        if (ev.detail.to > items.length - 1) {
            toIndex = items.length - 1;
        } else {
            toIndex = ev.detail.to;
        }
        // Moving target element to new place
        const itemMove = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, itemMove);
        // Correcting orders according to the new order
        for (let i = 0; i < items.length; i++) {
            await DataStore.query(Todo, items[i].id).then(ori => {
                DataStore.save(
                    Todo.copyOf(ori, updated => {
                        updated.order = i;
                    })
                );
            });
        }
        this.itemList.items = items;
        // await this.loadData();
        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended.
        ev.detail.complete();
    }
}
