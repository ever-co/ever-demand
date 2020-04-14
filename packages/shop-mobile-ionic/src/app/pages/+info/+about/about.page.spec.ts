import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutPage } from './about.page';

describe('AboutPage', () => {
	let component: AboutPage;
	let fixture: ComponentFixture<AboutPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AboutPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AboutPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
