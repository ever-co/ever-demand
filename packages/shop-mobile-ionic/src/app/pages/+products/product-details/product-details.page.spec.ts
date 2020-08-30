import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailsPage } from './product-details.page';

describe('ProductDetailsPage', () => {
	let component: ProductDetailsPage;
	let fixture: ComponentFixture<ProductDetailsPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ProductDetailsPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductDetailsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
