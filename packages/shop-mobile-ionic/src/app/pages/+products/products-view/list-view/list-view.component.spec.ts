import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ProductsListViewComponent } from './list-view.component';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('ListViewPage', () => {
	let component: ProductsListViewComponent;
	let fixture: ComponentFixture<ProductsListViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ProductsListViewComponent],
			imports: [...translateTesting(), PipesModule],
			providers: [
				{
					provide: ProductLocalesService,
					useValue: createSpyObj('ProductLocalesService', {
						getTranslate: '',
					}),
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsListViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
