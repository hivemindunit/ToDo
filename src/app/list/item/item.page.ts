import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {ModalController} from '@ionic/angular';
import { ToDoItem, ToDoList } from '../../classes/item.class';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {BackButtonService} from '../../back-button.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})

export class ItemPage implements OnInit {
  @ViewChild('title', {static: true}) focusedInput: ElementRef;

  itemForm: FormGroup;
  momentjs: any = moment;
  isSubmitted = false;
  itemList: ToDoList;
  editItem: ToDoItem;
  user: string;
  item: ToDoItem;
  backButtonService: BackButtonService;
  constructor(private modalController: ModalController, public formBuilder: FormBuilder) { }

  ngOnInit() {
    /*
      If you pass in an 'editItem' property, then you create a copy to store changes to the existing item
      so that the original is not modified unless the user saves.
    */
    this.itemForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['']
    });
    this.item = this.editItem ? Object.assign({}, this.editItem) : new ToDoItem({});
    this.itemForm.controls.title.setValue(this.item.title);
    this.itemForm.controls.description.setValue(this.item.description);
    // focus on the #title element
    setTimeout(() => {
      // @ts-ignore
      this.focusedInput.setFocus();
    }, 500);
  }

  get formErrorControl() {
    return this.itemForm.controls;
  }

  save() {
    this.isSubmitted = true;
    if (!this.itemForm.valid) {
      return false;
    } else {
      this.item.title = this.itemForm.value.title;
      if (typeof(this.itemForm.value.description) !== 'undefined') {
        this.item.description = this.itemForm.value.description;
      }
      this.modalController.dismiss({
        itemList: this.itemList,
        /*
          You pass back either a newItem or editItem value depending on whether an edit operation is taking place
          so that the list module can decide whether to insert into the items array or splice into it.
        */
        newItem: !this.editItem ? this.item : null,
        editItem: this.editItem ? this.item : null
      });
    }
  }

  cancel() {
    this.modalController.dismiss({itemList: this.itemList});
  }

  // ionViewWillEnter() {
  //   this.backButtonService.quitOnBackButton = true;
  // }
  // ionViewWillLeave() {
  //   this.backButtonService.quitOnBackButton = false;
  // }
}
