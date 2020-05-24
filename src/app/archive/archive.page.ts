import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { Todo, TodoService } from '../todo.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.scss'],
})
export class ArchivePage implements OnInit {
  // itemList: ToDoList;
  user: any;
  todos: Todo[];
  // amplifyService: AmplifyService;
  constructor(// public amplify: AmplifyService,
              private router: Router,
              private todoService: TodoService) {
    // this.amplifyService = amplify;
  }

  async ngOnInit() {
    this.todoService.getTodos().subscribe(res => {
      // console.log(res);
      this.todos = res;
    });
  }

  async ionViewWillEnter() {
    // if (this.user != null) {
    //   await this.loadData();
    // }
  }

  private async loadData() {
    this.todoService.getTodos().subscribe(res => {
      this.todos = res;
    });
  }

  async revert(id: string) {
    this.todoService.getTodo(id).then(snapshot => {
      const item = snapshot.data() as Todo;
      delete item.doneAt;
      item.status = 'new';
      this.todoService.updateTodo(item, id);
    });
  }
}
