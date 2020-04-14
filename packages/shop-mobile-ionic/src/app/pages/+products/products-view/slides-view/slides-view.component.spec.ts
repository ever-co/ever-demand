import 'jasmine';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsSlidesViewComponent } from './slides-view.component';

describe('SlidesViewComponent', () => {
	let component: ProductsSlidesViewComponent;
	let fixture: ComponentFixture<ProductsSlidesViewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ProductsSlidesViewComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsSlidesViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
