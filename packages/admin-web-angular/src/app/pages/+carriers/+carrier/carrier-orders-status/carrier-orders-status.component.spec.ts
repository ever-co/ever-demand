import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ToasterService } from 'angular2-toaster';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { CarrierOrdersStatusComponent } from './carrier-orders-status.component';

@Pipe({ name: 'translate' })
class TranslateStubPipe implements PipeTransform {
	transform(key: string): string {
		return key;
	}
}

describe('CarrierOrdersStatusComponent', () => {
	let component: CarrierOrdersStatusComponent;
	let fixture: ComponentFixture<CarrierOrdersStatusComponent>;
	let carrierOrdersRouter: jasmine.SpyObj<CarrierOrdersRouter>;
	let orderRouter: jasmine.SpyObj<OrderRouter>;
	let toasterService: jasmine.SpyObj<ToasterService>;

	const refusal = () => new Error('Orders are no longer available');

	const startButton = (): HTMLButtonElement | null =>
		fixture.nativeElement.querySelector('.btn-startProcessing');

	const orderActionButtons = (): HTMLButtonElement[] =>
		Array.from(
			fixture.nativeElement.querySelectorAll(
				'[aria-label="Order Actions"] button'
			)
		);

	beforeEach(
		waitForAsync(() => {
			carrierOrdersRouter = jasmine.createSpyObj('CarrierOrdersRouter', [
				'selectedForDelivery',
				'cancelDelivery',
			]);
			orderRouter = jasmine.createSpyObj('OrderRouter', [
				'updateCarrierStatus',
			]);
			toasterService = jasmine.createSpyObj('ToasterService', ['pop']);

			TestBed.configureTestingModule({
				declarations: [CarrierOrdersStatusComponent, TranslateStubPipe],
				providers: [
					{
						provide: CarrierOrdersRouter,
						useValue: carrierOrdersRouter,
					},
					{ provide: OrderRouter, useValue: orderRouter },
					{ provide: ToasterService, useValue: toasterService },
				],
				schemas: [NO_ERRORS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent(CarrierOrdersStatusComponent);
		component = fixture.componentInstance;
		component.selectedCarrier = { id: 'carrier-1' } as any;
		component.selectedOrder = {
			id: 'order-1',
			carrierStatus: OrderCarrierStatus.NoCarrier,
		} as any;
		fixture.detectChanges();
	});

	describe('selectOrdersForDelivery', () => {
		it('puts the Start button back when the server refuses the select', async () => {
			carrierOrdersRouter.selectedForDelivery.and.rejectWith(refusal());

			await component.selectOrdersForDelivery();
			fixture.detectChanges();

			expect(component.loading).toBe(false);
			expect(component.selectedOrder.carrierStatus).toBe(
				OrderCarrierStatus.NoCarrier
			);
			expect(startButton()).not.toBeNull();
			expect(startButton()!.disabled).toBe(false);
			expect(orderActionButtons().length).toBe(0);
			expect(toasterService.pop).toHaveBeenCalledWith(
				'error',
				'Orders are no longer available'
			);
		});

		it('keeps the order selected when the server accepts the select', async () => {
			carrierOrdersRouter.selectedForDelivery.and.resolveTo({} as any);

			await component.selectOrdersForDelivery();
			fixture.detectChanges();

			expect(
				carrierOrdersRouter.selectedForDelivery
			).toHaveBeenCalledWith('carrier-1', ['order-1']);
			expect(component.loading).toBe(false);
			expect(component.selectedOrder.carrierStatus).toBe(
				OrderCarrierStatus.CarrierSelectedOrder
			);
			expect(startButton()).toBeNull();
			expect(orderActionButtons().length).toBe(2);
			expect(toasterService.pop).not.toHaveBeenCalled();
		});

		it('does not start a pick up or cancel while the select is pending', async () => {
			let refuseSelect: (error: Error) => void;
			carrierOrdersRouter.selectedForDelivery.and.returnValue(
				new Promise<any>((_resolve, reject) => (refuseSelect = reject))
			);

			const select = component.selectOrdersForDelivery();
			fixture.detectChanges();

			// Start is gone and Picked up / Cancel show while the server
			// has not answered: a double-click on Start lands on them.
			expect(startButton()).toBeNull();
			expect(orderActionButtons().length).toBe(2);
			orderActionButtons().forEach((button) => {
				expect(button.disabled).toBe(true);
				button.click();
			});
			await component.updateCarrierOrdersStatus(
				OrderCarrierStatus.CarrierPickedUpOrder
			);
			await component.cancelDelivery();

			expect(orderRouter.updateCarrierStatus).not.toHaveBeenCalled();
			expect(carrierOrdersRouter.cancelDelivery).not.toHaveBeenCalled();

			refuseSelect(refusal());
			await select;
			fixture.detectChanges();

			expect(component.selectedOrder.carrierStatus).toBe(
				OrderCarrierStatus.NoCarrier
			);
			expect(startButton()).not.toBeNull();
			expect(startButton()!.disabled).toBe(false);
		});
	});

	describe('once the order is selected', () => {
		beforeEach(() => {
			component.selectedOrder.carrierStatus =
				OrderCarrierStatus.CarrierSelectedOrder;
			fixture.detectChanges();
			spyOn(component.getChangeOrder, 'emit');
		});

		it('puts the status and buttons back when the server refuses the pick up', async () => {
			orderRouter.updateCarrierStatus.and.rejectWith(
				new Error('Refused')
			);

			await component.updateCarrierOrdersStatus(
				OrderCarrierStatus.CarrierPickedUpOrder
			);
			fixture.detectChanges();

			expect(component.loading).toBe(false);
			expect(component.selectedOrder.carrierStatus).toBe(
				OrderCarrierStatus.CarrierSelectedOrder
			);
			expect(orderActionButtons().length).toBe(2);
			orderActionButtons().forEach((button) =>
				expect(button.disabled).toBe(false)
			);
			expect(component.getChangeOrder.emit).not.toHaveBeenCalled();
			expect(toasterService.pop).toHaveBeenCalledWith('error', 'Refused');
		});

		it('emits the updated order when the server accepts the pick up', async () => {
			const updatedOrder = {
				id: 'order-1',
				carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
			} as any;
			orderRouter.updateCarrierStatus.and.resolveTo(updatedOrder);

			await component.updateCarrierOrdersStatus(
				OrderCarrierStatus.CarrierPickedUpOrder
			);

			expect(component.loading).toBe(false);
			expect(component.selectedOrder).toBe(updatedOrder);
			expect(component.getChangeOrder.emit).toHaveBeenCalledWith(
				updatedOrder
			);
			expect(toasterService.pop).not.toHaveBeenCalled();
		});

		it('keeps the order and enables the buttons when the server refuses the cancel', async () => {
			const order = component.selectedOrder;
			carrierOrdersRouter.cancelDelivery.and.rejectWith(
				new Error('Refused')
			);

			await component.cancelDelivery();
			fixture.detectChanges();

			expect(component.loading).toBe(false);
			expect(component.selectedOrder).toBe(order);
			expect(orderActionButtons().length).toBe(2);
			orderActionButtons().forEach((button) =>
				expect(button.disabled).toBe(false)
			);
			expect(component.getChangeOrder.emit).not.toHaveBeenCalled();
			expect(toasterService.pop).toHaveBeenCalledWith('error', 'Refused');
		});

		it('clears the order when the server accepts the cancel', async () => {
			carrierOrdersRouter.cancelDelivery.and.resolveTo({} as any);

			await component.cancelDelivery();

			expect(component.loading).toBe(false);
			expect(component.selectedOrder).toBeNull();
			expect(component.getChangeOrder.emit).toHaveBeenCalledWith(null);
			expect(toasterService.pop).not.toHaveBeenCalled();
		});
	});
});
