import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadedInformationComponent } from './loaded-information.component';

describe('LoadedInformationComponent', () => {
	let component: LoadedInformationComponent;
	let fixture: ComponentFixture<LoadedInformationComponent>;

	beforeEach(async () => {
			await TestBed.configureTestingModule({
				declarations: [LoadedInformationComponent],
				// ion-* elements (Ionic web components)
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LoadedInformationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
