import { Component, OnInit } from '@angular/core';
import {ToDoList} from '../classes/item.class';
import {AmplifyService} from 'aws-amplify-angular';
import {Router} from '@angular/router';
import {DataStore} from '@aws-amplify/datastore';
import {Todo} from '../../models';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.scss'],
})
export class ArchivePage implements OnInit {
  itemList: ToDoList;
  user: any;
  amplifyService: AmplifyService;
  constructor(public amplify: AmplifyService,
              private router: Router) {
    this.amplifyService = amplify;
  }

  async ngOnInit() {
    this.user = await this.amplifyService.auth().currentUserInfo();
    if (this.user == null) {
      await this.router.navigate(['/auth']);
    } else {
      await this.loadData();
    }
  }

  async ionViewWillEnter() {
    if (this.user != null) {
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

  archivedItems() {
    const items = this.itemList.items.filter(item => item.status === 'archived');
    return items.sort(this.compareItem);
  }

  async revert(id: string) {
    const i = this.itemList.items.findIndex(element => element.id === id);
    DataStore.query(Todo, id).then(original => {
      DataStore.save(
          Todo.copyOf(original, updated => {
            updated.status = 'new';
          })
      ).then(res => {
        this.router.navigate(['/']);
      });
    });
  }
}
