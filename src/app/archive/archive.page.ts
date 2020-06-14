import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Todo, TodoService} from '../shared/todo.service';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.scss'],
})
export class ArchivePage {
  todos: Todo[];
  constructor(private router: Router,
              public ngFireAuth: AngularFireAuth,
              private todoService: TodoService) {
    this.ngFireAuth.authState.subscribe(user => {
      this.todoService.getTodos().subscribe(res => {
        this.todos = res;
      });
    });
  }

  archivedTodos() {
    return this.todos.filter((o) => o.status === 'archived');
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
