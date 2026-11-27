import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ToasterService } from '@app/@core/toaster';
import { LocalDataSource, Ng2SmartTableModule } from '@app/@shared/smart-table';
import { WarehouseOrdersService } from '../../../@core/data/warehouseOrders.service';
import { WarehouseOrderComponent } from './warehouse-order.component';

/** The "nearby stores" table of a customer page (customer-warehouses-table.component.ts). */
@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `<ng2-smart-table
		[settings]="settings"
		[source]="source"
	></ng2-smart-table>`,
})
class NearbyStoresHostComponent {
	source = new LocalDataSource();
	settings = {
		actions: false,
		columns: {
			name: { title: 'Name' },
			actions: {
				title: 'Actions',
				filter: false,
				type: 'custom',
				renderComponent: WarehouseOrderComponent,
			},
		},
	};
}

describe('WarehouseOrderComponent (order button of the nearby stores on a customer page)', () => {
	let fixture: ComponentFixture<NearbyStoresHostComponent>;
	let el: HTMLElement;
	const makeOrderEmitter = new EventEmitter<any[]>();
	const modal = {
		open: vi.fn(() => ({
			componentInstance: { makeOrderEmitter },
			close: vi.fn(),
		})),
	};
	const orders = { createOrder: vi.fn(() => of({ id: 'order-1' })) };
	const toaster = { pop: vi.fn() };

	beforeEach(async () => {
		vi.clearAllMocks();
		TestBed.configureTestingModule({
			imports: [Ng2SmartTableModule, TranslatePipe],
			declarations: [NearbyStoresHostComponent, WarehouseOrderComponent],
			providers: [
				provideTranslateService(),
				{ provide: NgbModal, useValue: modal },
				{ provide: WarehouseOrdersService, useValue: orders },
				{ provide: ToasterService, useValue: toaster },
			],
		});
		fixture = TestBed.createComponent(NearbyStoresHostComponent);
		el = fixture.nativeElement;
		fixture.detectChanges();

		// the row shape ea-customer-stores.component.ts builds for every nearby store
		await fixture.componentInstance.source.load([
			{
				id: 'store-1',
				name: 'Store 1',
				actions: { actionName: 'Order', actionOwnerId: 'customer-1' },
			},
		]);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	});

	it('renders the order button of a nearby store', () => {
		expect(el.querySelector('tbody button')!.textContent!.trim()).toBe(
			'CUSTOMERS_VIEW.Order',
		);
	});

	it('orders from that store for the customer of the page', () => {
		el.querySelector<HTMLButtonElement>('tbody button')!.click();
		const products = [{ count: 1, productId: 'p1' }];
		makeOrderEmitter.emit(products);

		expect(orders.createOrder).toHaveBeenCalledWith({
			userId: 'customer-1',
			warehouseId: 'store-1',
			products,
		});
		expect(toaster.pop).toHaveBeenCalledWith(
			'success',
			'The order is finished!',
		);
	});
});
