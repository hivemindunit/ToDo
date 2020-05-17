import { v4 as uuid } from 'uuid';

export class ToDoList {
    userId: any;
    items: Array<ToDoItem>

    constructor(params) {
        this.items = params.items || [];
        this.userId = params.userId;
    }
}

export class ToDoItem {
    id: string;
    title: string;
    description: string;
    status: any;
    createdAt: string;
    doneAt: string;
    archivedAt: string;
    order: number;

    constructor(params) {
        this.id = uuid();
        this.title = params.title;
        this.description = params.description;
        this.order = params.order;
        this.status = 'new';
        this.createdAt = Date.now().toString();
    }
}
