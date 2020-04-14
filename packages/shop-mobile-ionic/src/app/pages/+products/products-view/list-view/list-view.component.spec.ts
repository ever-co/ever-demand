import 'jasmine';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsListViewComponent } from './list-view.component';

describe('ListViewPage', () => {
	let component: ProductsListViewComponent;
	let fixture: ComponentFixture<ProductsListViewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ProductsListViewComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsListViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
