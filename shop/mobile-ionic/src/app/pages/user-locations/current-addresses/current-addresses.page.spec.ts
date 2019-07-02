import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentAddressesPage } from './current-addresses.page';

describe('CurrentAddressesPage', () => {
  let component: CurrentAddressesPage;
  let fixture: ComponentFixture<CurrentAddressesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentAddressesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentAddressesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
