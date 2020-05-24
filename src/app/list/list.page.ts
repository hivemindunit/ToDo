import {Component, OnInit, AfterContentInit, Input, ViewChild} from '@angular/core';
import {IonReorderGroup, ModalController} from '@ionic/angular';
import {ToDoList, ToDoItem} from '../classes/item.class';
import {Events} from '../events.service';
import {ItemPage} from './item/item.page';
import {AuthGuard} from '../auth.guard';
import {AmplifyService} from 'aws-amplify-angular';
import {Router} from '@angular/router';
import {DataStore} from '@aws-amplify/datastore';
// import {Todo} from '../../models';
import {Auth} from 'aws-amplify';
// import { AngularFirestore } from 'angularfire2/firestore';
import { Todo, TodoService } from '../todo.service';

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
    fireStoreTaskList: any;
    fireStoreList: any;
    todos: Todo[];

    authState: any;
    // including AuthGuardService here so that it's available to listen to auth events
    authService: AuthGuard;
    amplifyService: AmplifyService;

    constructor(public modalController: ModalController,
                public events: Events,
                public guard: AuthGuard,
                public amplify: AmplifyService,
                private router: Router,
                private todoService: TodoService) {
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
        const items = this.itemList.items; //.filter(item => item.status !== 'archived');
        return items; //.sort(this.compareItem);
    }

    async ngOnInit() {
        this.todoService.getTodos().subscribe(res => {
            // console.log(res);
            this.todos = res;
        });
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
        // DataStore.query(Todo, item => item.status('notContains', 'archived')).then(res => {
        //     res = res.sort(this.compareItem);
        //     this.itemList = {
        //             userId: this.user.userId,
        //             // @ts-ignore
        //             // items: res.data.listTodos.items
        //             items: res
        //         };
        //     }
        // );
        // this.afAuth.authState.subscribe(user => {
        //     if (user) {
        //         this.userId = user.uid
        // const todoItems = this.fireStore.doc<any>('users/' + this.user.userId).collection('tasks');
        // this.fireStoreTaskList = this.fireStore.doc<any>('users/' + this.user.userId).collection('tasks').valueChanges();
        // this.fireStoreList = this.fireStore.doc<any>('users/' + this.user.userId).collection('tasks');
            // }
        // });
        // console.log(this.fireStoreList);
        // this.itemList = {
        //         userId: this.user.userId,
        //         // @ts-ignore
        //         // items: res.data.listTodos.items
        //         items: this.fireStoreList
        //     };
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
            console.log(result);
            if (typeof result.data !== 'undefined') {
                if (result.data.newItem) {
                    // ...and add a new item if modal passes back newItem
                    // const items = result.data.itemList.items; //.filter(item => item.status !== 'archived');
                    // console.log(items);
                    // let itemOrder;
                    // if (items.length === 0) {
                    //     itemOrder = 0;
                    // } else {
                    //     itemOrder = items[items.length - 1].order + 1;
                    // }
                    // console.log(items.length);
                    // const id = this.fireStore.createId();
                    // todo: Todo = {
                    //     task: 'test',
                    //     createdAt: new Date().getTime(),
                    //     priority: 2
                    // };
                    const newItem: Todo = {
                        // id: id,
                        title: result.data.newItem.title,
                        ...(typeof result.data.newItem.description === 'string' && {
                            description: result.data.newItem.description
                        }),
                        createdAt: new Date().getTime(),
                        status: result.data.newItem.status,
                        // order: itemOrder
                        order: 0
                    };
                    // result.data.itemList.items.push(newItem);
                    // DataStore.save(newItem);
                    // console.log(Object.assign({}, newItem));
                    // this.fireStoreList.doc(newItem.id).set(Object.assign({}, newItem));
                    this.todoService.addTodo(newItem).then(() => {
                        // loading.dismiss();
                        // this.nav.goBack('home');
                    });
                } else if (result.data.editItem) {
                    // ...or splice the items array if the modal passes back editItem
                    // const editItem = result.data.editItem;
                    // const i = this.itemList.items.findIndex(element => element.id === editItem.id);
                    // result.data.itemList.items[i] = editItem;
                    // DataStore.query(Todo, editItem.id).then(original => {
                    //     DataStore.save(
                    //         Todo.copyOf(original, updated => {
                    //             updated.title = editItem.title;
                    //             updated.description = editItem.description;
                    //         })
                    //     );
                    // });
                    this.todoService.updateTodo(result.data.editItem, result.data.editItem.id).then(() => {
                        // loading.dismiss();
                        // this.nav.goBack('home');
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
        await this.todoService.removeTodo(id);
    }

    async toggleComplete(id) {
        this.todoService.getTodo(id).then(snapshot => {
            const item = snapshot.data() as Todo;
            if (item.status === 'new') {
                item.status = 'complete';
                item.doneAt = new Date().getTime();
            } else {
                item.status = 'new';
                if (typeof item.doneAt !== 'undefined') {
                    delete item.doneAt;
                }
            }
            this.todoService.updateTodo(item, id);
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
        const items = this.todos; //this.itemList.items;
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
        console.log(items);
        // Moving target element to new place
        console.log('fromIndex', fromIndex);
        console.log('toIndex', toIndex);
        const itemMove = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, itemMove);
        // Correcting orders according to the new order
        console.log(items);
        for (let i = 0; i < items.length; i++) {
            const item = items[i] as Todo;
            console.log(item.id);
            // console.log(i);
            item.order = i;
            this.todoService.getTodo(item.id).then(snapshot => {
                const savedItem = snapshot.data() as Todo;
                console.log(savedItem);
                if (savedItem.order !== i) {
                    console.log('saving', item.id);
                    this.todoService.updateTodo(item, item.id);
                }
                // this.todoService.updateTodo(item, id);
            });
            // if (item.order !== i) {
            // }
        }
        // this.itemList.items = items;
        // await this.loadData();
        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended.
        ev.detail.complete();
        this.todoService.getTodos().subscribe(res => {
            // console.log(res);
            this.todos = res;
        });
    }
}
