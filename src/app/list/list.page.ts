import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToDoItem, ToDoList } from '../classes/item.class';
import { Events } from '../events.service';
import { ItemPage } from './item/item.page';
import { AuthGuard } from '../auth.guard';
import { AmplifyService } from 'aws-amplify-angular';
import { API, graphqlOperation } from 'aws-amplify';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';

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
              public amplify: AmplifyService) {
    this.authState = { loggedIn: false };
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
    const res = await API.graphql(graphqlOperation(queries.listTodos));
    // console.log(res);
    this.itemList = {
      userId: this.user.userId,
      // @ts-ignore
      items: res.data.listTodos.items
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
          console.log('modal closed');
          if (result.data.newItem) {
            // ...and add a new item if modal passes back newItem
            result.data.itemList.items.push(result.data.newItem);
            API.graphql(graphqlOperation(mutations.createTodo, {input: result.data.newItem}));
          } else if (result.data.editItem) {
            // ...or splice the items array if the modal passes back editItem
            result.data.itemList.items[i] = result.data.editItem;
            // tslint:disable-next-line:no-shadowed-variable
            const item = result.data.editItem;
            API.graphql(graphqlOperation(mutations.updateTodo, {
              input: {
                id: item.id,
                title: item.title,
                description: item.description
              }
            }));
          }
          this.modal.dismiss({
            dismissed: true
          });
      }
    });
    return this.modal.present();
  }

  async delete(i) {
    // console.log('delete');
    // console.log(i);
    const item = this.itemList.items[i];
    this.itemList.items.splice(i, 1);
    // console.log(item);
    API.graphql(graphqlOperation(mutations.deleteTodo, {input: { id: item.id }}));
  }

  async complete(i) {
    this.itemList.items[i].status = 'complete';
    const item = this.itemList.items[i];
    API.graphql(graphqlOperation(mutations.updateTodo, {
      input: {
        id: item.id,
        status: item.status
      }
    }));
  }
}
