import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RestoreAccessPage } from './restore-access.page';

describe('RestoreAccessPage', () => {
  let component: RestoreAccessPage;
  let fixture: ComponentFixture<RestoreAccessPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestoreAccessPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RestoreAccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
