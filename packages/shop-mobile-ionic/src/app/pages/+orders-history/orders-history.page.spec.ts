import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { NEVER } from 'rxjs';
import { Store } from '../../services/store.service';
import { OrdersHistoryPage } from './orders-history.page';

describe('OrdersHistoryPage', () => {
	let component: OrdersHistoryPage;
	let fixture: ComponentFixture<OrdersHistoryPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [OrdersHistoryPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{ provide: Store, useValue: { userId: 'user-1' } },
					{
						provide: Apollo,
						useValue: jasmine.createSpyObj('Apollo', {
							watchQuery: { valueChanges: NEVER },
						}),
					},
					{ provide: Platform, useValue: { isRTL: false } },
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(OrdersHistoryPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
