import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Cell, DataSet } from 'angular2-smart-table';
import OrderStatus from '@modules/server.common/enums/OrderStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { ordersFilter } from '../filters/orders-filters';
import { OrderStatusFilterPipe } from '../pages/+warehouse/warehouse.pipe';
import { FormWizardComponent, FormWizardModule } from './form-wizard/form-wizard.module';
import { bindViewCell } from './table-components/smart-table';
import { TimeAgoPipe } from './time-ago.pipe';

describe('amTimeAgo pipe (replaces ngx-moment)', () => {
	const now = Date.parse('2026-11-25T12:00:00Z');

	it('describes past and future times like moment', () => {
		expect(TimeAgoPipe.describe(now - 10_000, now)).toBe('a few seconds ago');
		expect(TimeAgoPipe.describe(now - 5 * 60_000, now)).toBe('5 minutes ago');
		expect(TimeAgoPipe.describe(now - 3 * 3600_000, now)).toBe('3 hours ago');
		expect(TimeAgoPipe.describe(now - 24 * 3600_000, now)).toBe('yesterday');
		expect(TimeAgoPipe.describe(now + 2 * 24 * 3600_000, now)).toBe('in 2 days');
	});

	it('is empty for missing or invalid dates', () => {
		const pipe = new TimeAgoPipe();
		expect(pipe.transform(null)).toBe('');
		expect(pipe.transform('not a date')).toBe('');
		expect(pipe.transform(new Date())).toBe('a few seconds ago');
	});
});

describe('bindViewCell (angular2-smart-table custom renderers)', () => {
	/** A real angular2-smart-table cell for `rowData[columnId]`. */
	const cellFor = (rowData: any, columnId: string, columnSettings: any = {}): Cell => {
		const dataSet = new DataSet([rowData], { [columnId]: columnSettings });
		return dataSet.getRows()[0].getCell(dataSet.getColumns()[0]);
	};

	it('sets value and rowData, then runs the column initializer', () => {
		const instance: Record<string, unknown> = {};
		const init = vi.fn();
		const row = { id: 'c1', phone: '0888 123' };
		const cell = cellFor(row, 'phone');

		bindViewCell(init)(instance, cell);

		expect(instance.value).toBe('0888 123');
		expect(instance.rowData).toBe(row);
		expect(init).toHaveBeenCalledWith(instance, cell);
	});

	it('passes object, number and boolean values unchanged, like ng2-smart-table', () => {
		// angular2-smart-table's cell.getValue() falls back to `v?.toString()`: the order modal's
		// `amount` cell ({ productId, available }) reached its input as "[object Object]".
		const amount = { productId: 'p1', available: 3 };
		const row = { id: 'w1', amount, count: 0, isAvailable: false };
		const valueOf = (columnId: string) => {
			const instance: Record<string, unknown> = {};
			bindViewCell()(instance, cellFor(row, columnId));
			return instance.value;
		};

		expect(valueOf('amount')).toBe(amount);
		expect(valueOf('count')).toBe(0);
		expect(valueOf('isAvailable')).toBe(false);
	});

	it('passes the prepared value when the column has a valuePrepareFunction', () => {
		const instance: Record<string, unknown> = {};
		const cell = cellFor({ id: 'p1', price: 2 }, 'price', {
			valuePrepareFunction: (price: number) => `$${price}`,
		});

		bindViewCell()(instance, cell);

		expect(instance.value).toBe('$2');
	});
});

describe('ordersFilter', () => {
	const order = (o: Record<string, unknown>) =>
		({ isConfirmed: true, isCancelled: false, isCompleted: false, ...o }) as any;
	const orders = [
		order({ id: 'prep', status: OrderStatus.WarehousePreparation, warehouseStatus: OrderWarehouseStatus.PackagingStarted }),
		order({ id: 'packed', status: OrderStatus.InDelivery, warehouseStatus: OrderWarehouseStatus.PackagingFinished }),
		order({ id: 'driving', status: OrderStatus.InDelivery, warehouseStatus: OrderWarehouseStatus.GivenToCarrier }),
		order({ id: 'new', status: OrderStatus.WarehousePreparation, warehouseStatus: OrderWarehouseStatus.NoStatus, isConfirmed: false }),
		order({ id: 'cancelled', status: OrderStatus.CanceledWhileWarehousePreparation, warehouseStatus: OrderWarehouseStatus.NoStatus, isCancelled: true }),
	];
	const ids = (mode: any) => ordersFilter(orders, mode).map((o) => o.id);

	it('splits the store orders by stage', () => {
		expect(ids('ready')).toEqual(['prep', 'packed', 'new']);
		expect(ids('in_delivery')).toEqual(['packed', 'driving']);
		expect(ids('not_confirmed')).toEqual(['new']);
		expect(ids('cancelled')).toEqual(['cancelled']);
		expect(ids('all')).toHaveLength(5);
	});
});

describe('skipStatus pipe', () => {
	it('keeps the first status and drops the middle ones when asked', () => {
		const pipe = new OrderStatusFilterPipe();
		expect(pipe.transform(['a', 'b', 'c', 'd', 'e'] as any, true)).toEqual(['a', 'e']);
		expect(pipe.transform(['a', 'b'] as any, false)).toEqual(['a', 'b']);
	});
});

@Component({
	template: `
		<form-wizard #wizard>
			<wizard-step title="One" [isValid]="firstValid" (onNext)="log.push('next 1')">
				<p class="step-1">first</p>
			</wizard-step>
			<wizard-step title="Two" (onComplete)="log.push('done')" (onPrev)="log.push('prev 2')">
				<p class="step-2">second</p>
			</wizard-step>
		</form-wizard>
	`,
	imports: [FormWizardModule],
	changeDetection: ChangeDetectionStrategy.Eager,
})
class WizardHostComponent {
	@ViewChild('wizard', { static: true }) wizard: FormWizardComponent;
	firstValid = false;
	log: string[] = [];
}

describe('FormWizard (replaces @ever-co/angular2-wizard)', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({ imports: [WizardHostComponent] })
	);

	it('walks through the steps with the same API and markup', () => {
		const fixture = TestBed.createComponent(WizardHostComponent);
		fixture.detectChanges();
		const host = fixture.componentInstance;
		const el: HTMLElement = fixture.nativeElement;
		const visible = (sel: string) => !el.querySelector(sel).closest('[hidden]');
		const button = (text: string) =>
			Array.from(el.querySelectorAll<HTMLButtonElement>('.card-footer button')).find(
				(b) => b.textContent.trim() === text
			);

		expect(Array.from(el.querySelectorAll('.nav-item a')).map((a) => a.textContent)).toEqual(['One', 'Two']);
		expect(visible('.step-1')).toBe(true);
		expect(visible('.step-2')).toBe(false);
		expect(button('Next').disabled).toBe(true); // step 1 is not valid yet

		host.firstValid = true;
		fixture.detectChanges();
		button('Next').click();
		fixture.detectChanges();
		expect(host.log).toEqual(['next 1']);
		expect(visible('.step-2')).toBe(true);
		expect(host.wizard.hasNextStep).toBe(false);

		host.wizard.previous();
		fixture.detectChanges();
		expect(visible('.step-1')).toBe(true);

		host.wizard.next();
		button('Done').click();
		fixture.detectChanges();
		expect(host.log).toEqual(['next 1', 'prev 2', 'next 1', 'done']);
		expect(host.wizard.isCompleted).toBe(true);
	});
});
