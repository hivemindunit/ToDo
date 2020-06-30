import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {AuthenticationService} from './authentication-service';
import {AngularFireAuth} from '@angular/fire/auth';

export interface Todo {
  id?: string;
  title: string;
  description: string;
  status: string;
  createdAt: number;
  doneAt?: number;
  archivedAt?: number;
  order: number;
}

@Injectable({
  providedIn: 'root'
})

export class TodoService {
  private todosCollection: AngularFirestoreCollection<Todo>;
  private todos: Observable<Todo[]>;

  public batch: any;

  constructor(db: AngularFirestore, authService: AuthenticationService, private ngFireAuth: AngularFireAuth) {
    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.todosCollection = db.collection<Todo>('users/' + authService.userData.uid + '/todos', ref => ref.orderBy('order'));
        this.todos = this.todosCollection.snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...data };
              });
            })
        );
        this.batch = db.firestore.batch();
        this.cleanUp();
      }
    });
  }

  getTodos() {
    return this.todos;
  }

  getTodo(id) {
    return this.todosCollection.doc<Todo>(id).get().toPromise();
  }

  updateTodo(todo: Todo, id: string) {
    return this.todosCollection.doc(id).update(todo);
  }

  updateTodoAttributes(updatedAttributes: {}, id: string) {
    return this.todosCollection.doc(id).set(updatedAttributes, { merge: true });
  }

  addTodo(todo: Todo) {
    return this.todosCollection.add(todo);
  }

  removeTodo(id) {
    return this.todosCollection.doc(id).delete();
  }

  private async cleanUp() {
    let obsoleteTodos;
    const oneDayAgo = Math.round((new Date()).getTime() / 1000 - 60 * 60 * 24);
    this.todos.subscribe(res => {
      obsoleteTodos = res.filter((o) => o.status === 'archived');
      for (const item of obsoleteTodos) {
        const itemArchivedAt = parseInt(String(item.archivedAt / 1000), 10);
        if (itemArchivedAt < oneDayAgo) {
          this.removeTodo(item.id);
        }
      }
    });
  }
}
