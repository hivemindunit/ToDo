import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToDoItem, ToDoList } from '../classes/item.class';
import { Events } from '../events.service';
import { ItemPage } from './item/item.page';
import {AuthGuard} from '../auth.guard';

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

  constructor(public modalController: ModalController, public events: Events, public guard: AuthGuard) {
    this.authState = { loggedIn: false };
    this.authService = guard;
    // Listen for changes to the AuthState in order to change item list appropriately
    events.subscribe('data:AuthState', async (data: any) => {
      if (data.loggedIn) {
        this.getItems();
      } else {
        this.itemList.items = [];
      }
    });
  }

  ngAfterContentInit(){
    this.events.publish('data:AuthState', this.authState);
  }

  login() {
    this.authState.loggedIn = true;
    this.events.publish('data:AuthState', this.authState);
    console.log(this.authState);
  }

  logout() {
    this.authState.loggedIn = false;
    this.events.publish('data:AuthState', this.authState);
    console.log(this.authState);
  }

  async ngOnInit() {
    this.getItems();
  }

  async modify(item, i) {
    let props = {
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
          } else if (result.data.editItem) {
            // ...or splice the items array if the modal passes back editItem
            result.data.itemList.items[i] = result.data.editItem;
          }
          this.save(result.data.itemList);
      }
    });
    return this.modal.present();
  }

  delete(i) {
    this.itemList.items.splice(i, 1);
    // this.save(this.itemList);
  }

  complete(i) {
    this.itemList.items[i].status = 'complete';
    // this.save(this.itemList);
  }

  save(list) {
    // Use AWS Amplify to save the list...
    this.modal.dismiss({
      'dismissed': true
    });
    this.itemList = list;
  }

  getItems() {
    this.itemList = {
      userId: 1,
      items: [
        new ToDoItem({
          id: '1',
          title: 'test item 1',
          description: 'my test item',
          status: 'complete'
        }),
        new ToDoItem({
          id: '2',
          title: 'test item 3',
          description: 'my other test item',
          status: 'pending'
        })
      ]
    };
  }
}
