import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Apollo } from 'apollo-angular';
import { NEVER } from 'rxjs';
import { Store } from '../../services/store.service';
import { OrdersHistoryPage } from './orders-history.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('OrdersHistoryPage', () => {
	let component: OrdersHistoryPage;
	let fixture: ComponentFixture<OrdersHistoryPage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [OrdersHistoryPage],
			imports: [...translateTesting()],
			providers: [
				{ provide: Store, useValue: { userId: 'user-1' } },
				{
					provide: Apollo,
					useValue: createSpyObj('Apollo', {
						watchQuery: { valueChanges: NEVER },
					}),
				},
				{ provide: Platform, useValue: { isRTL: false } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OrdersHistoryPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
