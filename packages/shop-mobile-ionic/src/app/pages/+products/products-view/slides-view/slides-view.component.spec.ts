import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { Store } from '../../../../services/store.service';
import { ProductsSlidesViewComponent } from './slides-view.component';

describe('SlidesViewComponent', () => {
	let component: ProductsSlidesViewComponent;
	let fixture: ComponentFixture<ProductsSlidesViewComponent>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [ProductsSlidesViewComponent],
				// IonicModule declares the ion-slides that ngAfterViewInit reads.
				imports: [IonicModule, TranslateModule.forRoot(), PipesModule],
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
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', ['navigate']),
					},
					{ provide: Store, useValue: {} },
				],
			}).compileComponents();
		})
	);

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
