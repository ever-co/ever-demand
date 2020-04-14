import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IssuePage } from './issue.page';

describe('IssuePage', () => {
	let component: IssuePage;
	let fixture: ComponentFixture<IssuePage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [IssuePage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(IssuePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
