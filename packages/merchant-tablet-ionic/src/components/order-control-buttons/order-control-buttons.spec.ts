import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { BehaviorSubject } from 'rxjs';
import { Store } from '../../services/store.service';
import { WarehousesService } from '../../services/warehouses.service';
import { OrderControlButtonsComponent } from './order-control-buttons';
import { ComponentsModule } from '../components.module';

/** The buttons a store uses to move an order through the warehouse statuses. */
describe('OrderControlButtonsComponent', () => {
	let fixture: ComponentFixture<OrderControlButtonsComponent>;
	let update: ReturnType<typeof vi.fn>;
	const process$ = new BehaviorSubject({ ordersShortProcess: false });

	beforeEach(async () => {
		update = vi.fn();
		await TestBed.configureTestingModule({
			imports: [ComponentsModule, TranslateModule.forRoot()],
			providers: [
				{ provide: OrderRouter, useValue: {} },
				{ provide: Store, useValue: { warehouseId: 'w1' } },
				{
					provide: WarehousesService,
					useValue: { getWarehouseOrderProcess: () => process$ },
				},
			],
		}).compileComponents();
	});

	function render(
		warehouseStatus: OrderWarehouseStatus,
		extra: Partial<OrderControlButtonsComponent> = {}
	) {
		fixture = TestBed.createComponent(OrderControlButtonsComponent);
		Object.assign(fixture.componentInstance, {
			orderId: 'o1',
			warehouseStatus,
			carrierStatus: OrderCarrierStatus.NoCarrier,
			orderType: DeliveryType.Delivery,
			onUpdateWarehouseStatus: update,
			...extra,
		});
		fixture.detectChanges();
		return Array.from(
			(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('a.button, button.button')
		);
	}

	const click = (buttons: HTMLElement[], index = 0) => {
		buttons[index].click();
		return update.mock.calls.at(-1);
	};

	it('walks a delivery order through the full warehouse process', () => {
		const steps: [OrderWarehouseStatus, OrderWarehouseStatus][] = [
			[OrderWarehouseStatus.NoStatus, OrderWarehouseStatus.ReadyForProcessing],
			[OrderWarehouseStatus.ReadyForProcessing, OrderWarehouseStatus.WarehouseStartedProcessing],
			[OrderWarehouseStatus.WarehouseStartedProcessing, OrderWarehouseStatus.AllocationStarted],
			[OrderWarehouseStatus.AllocationStarted, OrderWarehouseStatus.AllocationFinished],
			[OrderWarehouseStatus.AllocationFinished, OrderWarehouseStatus.PackagingStarted],
			[OrderWarehouseStatus.PackagingStarted, OrderWarehouseStatus.PackagingFinished],
		];
		for (const [current, next] of steps) {
			expect(click(render(current))).toEqual(['o1', next]);
		}
	});

	it('jumps straight to packaging with the short order process', () => {
		process$.next({ ordersShortProcess: true });
		expect(click(render(OrderWarehouseStatus.NoStatus))).toEqual([
			'o1',
			OrderWarehouseStatus.PackagingStarted,
		]);
		process$.next({ ordersShortProcess: false });
	});

	it('reports allocation and packaging failures', () => {
		expect(click(render(OrderWarehouseStatus.AllocationStarted), 1)).toEqual([
			'o1',
			OrderWarehouseStatus.AllocationFailed,
		]);
		expect(click(render(OrderWarehouseStatus.PackagingStarted), 1)).toEqual([
			'o1',
			OrderWarehouseStatus.PackagingFailed,
		]);
	});

	it('hands a packaged order to the carrier only after the pick-up', () => {
		const waiting = render(OrderWarehouseStatus.PackagingFinished);
		expect(waiting).toHaveLength(1);
		expect((waiting[0] as HTMLButtonElement).disabled).toBe(true);

		const pickedUp = render(OrderWarehouseStatus.PackagingFinished, {
			carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
		});
		expect(click(pickedUp)).toEqual(['o1', OrderWarehouseStatus.GivenToCarrier]);
	});

	it('hands a packaged takeaway order to the customer', () => {
		const buttons = render(OrderWarehouseStatus.PackagingFinished, {
			orderType: DeliveryType.Takeaway,
		});
		expect(click(buttons)).toEqual(['o1', OrderWarehouseStatus.GivenToCustomer]);
	});
});
