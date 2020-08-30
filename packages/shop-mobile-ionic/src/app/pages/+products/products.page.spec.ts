import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsPage } from './products.page';

describe('ProductsPage', () => {
	let component: ProductsPage;
	let fixture: ComponentFixture<ProductsPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ProductsPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
