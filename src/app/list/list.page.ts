import {Component, OnInit, ViewChild} from '@angular/core';
import {IonProgressBar, IonReorderGroup, ModalController, Platform} from '@ionic/angular';
import {Events} from '../events.service';
import {ItemPage} from './item/item.page';
import {Router} from '@angular/router';
import {Todo, TodoService} from '../shared/todo.service';
import {AuthenticationService} from '../shared/authentication-service';
import {AngularFireAuth} from '@angular/fire/auth';
import {ToastController} from '@ionic/angular';
import {Plugins} from '@capacitor/core';
import {AdOptions, AdSize, AdPosition} from 'capacitor-admob';
import {environment} from '../../environments/environment';
import {AngularFireFunctions} from '@angular/fire/functions';
import * as _ from 'lodash';

const { AdMob } = Plugins;

@Component({
    selector: 'app-list-page',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss']
})

export class ListPage implements OnInit {
    @ViewChild(IonReorderGroup, {static: true}) reorderGroup: IonReorderGroup;
    @ViewChild(IonProgressBar, {static: true}) progressBar: IonProgressBar;
    modal: any;
    todos: Todo[];
    archivedTodos: Todo[];
    reorderEnabled = true;
    adIsLoaded = false;
    reorderTasksCloudFn: any;

    options: AdOptions = {
        adId: environment.androidListBottomAdId,
        adSize: AdSize.SMART_BANNER,
        position: AdPosition.BOTTOM_CENTER
    };

    constructor(public modalController: ModalController,
                public events: Events,
                private router: Router,
                public authService: AuthenticationService,
                public ngFireAuth: AngularFireAuth,
                private todoService: TodoService,
                public toastController: ToastController,
                public platform: Platform,
                private fns: AngularFireFunctions) {
        this.ngFireAuth.authState.subscribe(user => {
            if (user) {
                this.todoService.getTodos().subscribe(res => {
                    this.todos = res.filter((o) => o.status !== 'archived').sort(function(a, b){
                        return a.order - b.order;
                    });
                });
                this.todoService.getTodos().subscribe(res => {
                    this.archivedTodos = res.filter((o) => o.status === 'archived');
                });
            } else {
                router.navigate(['auth']);
            }
        });
        this.reorderTasksCloudFn = _.debounce(() => {
            const ids = this.todos.map(({ id }) => id);
            const reorderWasEnabled = this.reorderEnabled;
            if (reorderWasEnabled) {
                this.reorderEnabled = false;
            }
            this.progressBar.type = 'indeterminate';
            // console.log(ids);
            this.fns.httpsCallable('reorderTasks')({ids}).toPromise()
                    .then((response) => {
                        console.log(response);
                        if (reorderWasEnabled) {
                            this.reorderEnabled = true;
                        }
                        this.progressBar.type = 'determinate';
                    })
                    .catch((err) => console.error('error', err));
        }, 5000);
    }

    ngOnInit(): void {
        if (this.platform.is('android') || this.platform.is('ios')) {
            AdMob.showBanner(this.options).then(
                value => {
                    console.log(value); // true
                },
                error => {
                    console.error(error); // show error
                }
            );
            // On ad failed to load
            AdMob.addListener('onAdFailedToLoad', (info: any) => {
                console.log('onAdFailedToLoad invoked');
                console.log(info);
            });
            AdMob.addListener('onAdLoaded', (info: any) => {
                this.adIsLoaded = true;
            });
        }
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
                        order: this.todos.length
                    };
                    this.todoService.addTodo(newItem);
                    this.notify('Item added', false);
                } else if (result.data.editItem) {
                    // ...or splice the items array if the modal passes back editItem
                    this.todoService.updateTodo(result.data.editItem, result.data.editItem.id);
                    this.notify('Item updated', false);
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
        await this.notify('Item archived', true, id);
        this.recalculateOrder();
    }

    async toggleComplete(id) {
        const item = this.todos.find(x => x.id === id);
        if (item.status === 'new') {
            item.status = 'complete';
            item.doneAt = new Date().getTime();
        } else {
            item.status = 'new';
            if (typeof item.doneAt !== 'undefined') {
                delete item.doneAt;
            }
        }
        await this.todoService.updateTodo(item, id);
    }

    async doReorder(ev: any) {
        // Moving target element to new place
        const itemMove = this.todos.splice(ev.detail.from, 1)[0];
        this.todos.splice(ev.detail.to, 0, itemMove);
        // Finish the reorder and position the item in the DOM based on
        // where the gesture ended.
        // Call a cloud debounced function to save new order in database
        this.reorderTasksCloudFn();
        ev.detail.complete();
    }

    recalculateOrder() {
        for (let i = 0; i < this.todos.length; i++) {
            if (this.todos[i].order !== i) {
                this.todoService.updateTodoAttributes({order: i}, this.todos[i].id);
            }
        }
    }

    isArchiveEmpty() {
        if (this.archivedTodos) {
            return this.archivedTodos.length === 0;
        } else {
            return true;
        }
    }

    notDoneItemsCount() {
        if (this.todos) {
            return this.todos.length;
        } else {
            return 0;
        }
    }

    maybePluralize(count, noun, suffix = 's') {
        return `${count} ${noun}${count !== 1 ? suffix : ''}`;
    }

    completedPercentage() {
        if (typeof(this.todos) !== 'undefined') {
            return this.todos.filter((o) => o.status === 'complete').length / this.todos.length;
        } else {
            return 0;
        }
    }

    async notify(title: string, isUndo: boolean, itemId: string = null) {
        let toastOptions = {
            message: title,
            duration: 1000
        };
        if (this.platform.is('android') || this.platform.is('ios')) {
            toastOptions = {...toastOptions, ...{ position: 'middle' }};
        }
        if (isUndo) {
            toastOptions.duration = 2500;
            toastOptions = {...toastOptions, ...{
                buttons: [
                        {
                            side: 'end',
                            icon: 'refresh',
                            role: 'cancel',
                            text: 'Undo',
                            handler: () => {
                                this.todoService.getTodo(itemId).then(snapshot => {
                                    const item = snapshot.data() as Todo;
                                    delete item.doneAt;
                                    item.status = 'new';
                                    this.todoService.updateTodo(item, itemId);
                                });
                            }
                        }
                    ]}};
        }
        const toast = await this.toastController.create(toastOptions);
        await toast.present();
    }
}
