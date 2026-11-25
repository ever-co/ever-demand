import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ProductsListViewComponent } from './list-view.component';

describe('ListViewPage', () => {
	let component: ProductsListViewComponent;
	let fixture: ComponentFixture<ProductsListViewComponent>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ProductsListViewComponent],
				imports: [TranslateModule.forRoot(), PipesModule],
				providers: [
					{
						provide: ProductLocalesService,
						useValue: jasmine.createSpyObj(
							'ProductLocalesService',
							{
								getTranslate: '',
							}
						),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductsListViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
