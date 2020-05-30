import {Component, ViewChild} from '@angular/core';
import {IonReorderGroup, ModalController} from '@ionic/angular';
import {Events} from '../events.service';
import {ItemPage} from './item/item.page';
import {Router} from '@angular/router';
import {Todo, TodoService} from '../shared/todo.service';
import {AuthenticationService} from '../shared/authentication-service';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
    selector: 'app-list-page',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss']
})

export class ListPage {
    @ViewChild(IonReorderGroup, {static: true}) reorderGroup: IonReorderGroup;
    modal: any;
    todos: Todo[];

    constructor(public modalController: ModalController,
                public events: Events,
                private router: Router,
                public authService: AuthenticationService,
                public ngFireAuth: AngularFireAuth,
                private todoService: TodoService) {
        this.ngFireAuth.authState.subscribe(user => {
            if (user) {
                this.todoService.getTodos().subscribe(res => {
                    this.todos = res;
                });
            } else {
                router.navigate(['auth']);
            }
        });
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
