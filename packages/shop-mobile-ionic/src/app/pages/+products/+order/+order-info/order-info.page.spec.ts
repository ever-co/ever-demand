import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { NEVER } from 'rxjs';
import { Store } from '../../../../services/store.service';
import { OrderInfoPage } from './order-info.page';

describe('OrderInfoPage', () => {
	let component: OrderInfoPage;
	let fixture: ComponentFixture<OrderInfoPage>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [OrderInfoPage],
				imports: [TranslateModule.forRoot()],
				providers: [
					// The order and the warehouse never load, so no modal opens.
					{
						provide: OrderRouter,
						useValue: jasmine.createSpyObj('OrderRouter', {
							get: NEVER,
						}),
					},
					{
						provide: WarehouseRouter,
						useValue: jasmine.createSpyObj('WarehouseRouter', {
							get: NEVER,
						}),
					},
					{
						provide: Store,
						useValue: { startOrderDate: '"2026-01-01T00:00:00Z"' },
					},
					{
						provide: ModalController,
						useValue: jasmine.createSpyObj('ModalController', [
							'create',
						]),
					},
					{
						provide: NavController,
						useValue: jasmine.createSpyObj('NavController', [
							'navigateRoot',
						]),
					},
					{
						provide: Router,
						useValue: jasmine.createSpyObj('Router', [
							'navigateByUrl',
						]),
					},
				],
				schemas: [CUSTOM_ELEMENTS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(OrderInfoPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
