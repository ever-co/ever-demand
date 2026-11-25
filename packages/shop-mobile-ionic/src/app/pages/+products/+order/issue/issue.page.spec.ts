import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { Store } from 'app/services/store.service';
import { IssuePage } from './issue.page';

describe('IssuePage', () => {
	let component: IssuePage;
	let fixture: ComponentFixture<IssuePage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [IssuePage],
				imports: [TranslateModule.forRoot()],
				providers: [
					{
						provide: NavParams,
						useValue: jasmine.createSpyObj('NavParams', {
							get: undefined,
						}),
					},
					{
						provide: OrderRouter,
						useValue: jasmine.createSpyObj('OrderRouter', [
							'refundWithStripe',
						]),
					},
					{
						provide: WarehouseOrdersRouter,
						useValue: jasmine.createSpyObj(
							'WarehouseOrdersRouter',
							['cancel']
						),
					},
					{ provide: Store, useValue: {} },
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', ['navigate']),
					},
					{
						provide: NavController,
						useValue: jasmine.createSpyObj('NavController', [
							'navigateRoot',
						]),
					},
					{
						provide: ModalController,
						useValue: jasmine.createSpyObj('ModalController', [
							'dismiss',
						]),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(IssuePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
