import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { Store } from '../../../../services/store.service';
import { ProductsSlidesViewComponent } from './slides-view.component';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('SlidesViewComponent', () => {
	let component: ProductsSlidesViewComponent;
	let fixture: ComponentFixture<ProductsSlidesViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ProductsSlidesViewComponent],
			// <swiper-container> is a custom element (Swiper element), and
			// ng-progress a standalone component the page module imports.
			imports: [...translateTesting(), PipesModule],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{
					provide: ProductLocalesService,
					useValue: createSpyObj('ProductLocalesService', {
						getTranslate: '',
					}),
				},
				{
					provide: Router,
					useValue: createSpyObj('Router', ['navigate']),
				},
				{ provide: Store, useValue: {} },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsSlidesViewComponent);
		component = fixture.componentInstance;
		// The products page always passes a product list.
		component.products = [];
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
