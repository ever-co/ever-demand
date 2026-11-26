import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { Store } from 'app/services/store.service';
import { IssuePage } from './issue.page';
import { createSpyObj } from 'app/testing/spies';
import { translateTesting } from 'app/testing/translate';

describe('IssuePage', () => {
	let component: IssuePage;
	let fixture: ComponentFixture<IssuePage>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [IssuePage],
			imports: [...translateTesting()],
			providers: [
				{
					provide: NavParams,
					useValue: createSpyObj('NavParams', {
						get: undefined,
					}),
				},
				{
					provide: OrderRouter,
					useValue: createSpyObj('OrderRouter', ['refundWithStripe']),
				},
				{
					provide: WarehouseOrdersRouter,
					useValue: createSpyObj('WarehouseOrdersRouter', ['cancel']),
				},
				{ provide: Store, useValue: {} },
				{
					provide: Router,
					useValue: createSpyObj('Router', ['navigate']),
				},
				{
					provide: NavController,
					useValue: createSpyObj('NavController', ['navigateRoot']),
				},
				{
					provide: ModalController,
					useValue: createSpyObj('ModalController', ['dismiss']),
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(IssuePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
