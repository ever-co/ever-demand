import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpPage } from './help.page';

describe('HelpPage', () => {
	let component: HelpPage;
	let fixture: ComponentFixture<HelpPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [HelpPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HelpPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
