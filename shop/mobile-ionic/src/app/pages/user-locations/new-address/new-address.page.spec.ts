import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAddressPage } from './new-address.page';

describe('NewAddressPage', () => {
  let component: NewAddressPage;
  let fixture: ComponentFixture<NewAddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAddressPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
