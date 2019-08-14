import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLocationsPage } from './user-locations.page';

describe('UserLocationsPage', () => {
  let component: UserLocationsPage;
  let fixture: ComponentFixture<UserLocationsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserLocationsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLocationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
