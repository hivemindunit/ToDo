import {Component, OnInit, AfterContentInit, Input, ViewChild} from '@angular/core';
import {IonReorderGroup, ModalController} from '@ionic/angular';
import {Events} from '../events.service';
import {ItemPage} from './item/item.page';
import {AuthGuard} from '../auth.guard';
import {Router} from '@angular/router';
import {Auth} from 'aws-amplify';
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
    signedIn: boolean;
    todos: Todo[];

    authState: any;
    // including AuthGuardService here so that it's available to listen to auth events
    authService: AuthGuard;

    constructor(public modalController: ModalController,
                public events: Events,
                public guard: AuthGuard,
                // public amplify: AmplifyService,
                private router: Router,
                private todoService: TodoService) {
        this.authState = {loggedIn: false};
        this.authService = guard;
    }

    async ngOnInit() {
        this.todoService.getTodos().subscribe(res => {
            // console.log(res);
            this.todos = res;
        });
    }

    ngAfterContentInit() {
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
        if (this.user == null) {
            await this.router.navigate(['/auth']);
        } else {
            await this.loadData();
        }
    }

    private async loadData() {
    }

    async modify(item) {
        const props = {
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
                    const newItem: Todo = {
                        title: result.data.newItem.title,
                        ...(typeof result.data.newItem.description === 'string' && {
                            description: result.data.newItem.description
                        }),
                        createdAt: new Date().getTime(),
                        status: result.data.newItem.status,
                        order: this.todos.length + 1
                    };
                    this.todoService.addTodo(newItem);
                } else if (result.data.editItem) {
                    // ...or splice the items array if the modal passes back editItem
                    this.todoService.updateTodo(result.data.editItem, result.data.editItem.id);
                }
                this.modal.dismiss({
                    dismissed: true
                });
            }
        });
        return this.modal.present();
    }

    async delete(id) {
        await this.todoService.updateTodoAttributes({
            status: 'archived',
            archivedAt: new Date().getTime()
        }, id);
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
        let fromIndex, toIndex;
        const ids = this.todos.map(a => a.id);
        // in some cases detail.from or detail.to exceeds array boundaries. The code below is to correct that
        if (ev.detail.from > ids.length - 1) {
            fromIndex = ids.length - 1;
        } else {
            fromIndex = ev.detail.from;
        }
        if (ev.detail.to > ids.length - 1) {
            toIndex = ids.length - 1;
        } else {
            toIndex = ev.detail.to;
        }
        // Moving target element to new place
        const itemMove = ids.splice(fromIndex, 1)[0];
        ids.splice(toIndex, 0, itemMove);
        // Correcting orders according to the new order
        for (let i = 0; i < ids.length; i++) {
            if (this.todos.find(x => x.id === ids[i]).order !== i) {
                this.todoService.updateTodoAttributes({order: i}, ids[i]).then(r => {
                        ev.detail.complete();
                });
            }
        }
        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended.
        ev.detail.complete();
    }
}
