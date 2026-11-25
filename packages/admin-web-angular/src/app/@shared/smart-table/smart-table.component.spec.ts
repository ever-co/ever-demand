import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalDataSource, Ng2SmartTableModule, ViewCell } from './index';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `<span class="name-renderer"
		>{{ rowData.name }} ({{ value }})</span
	>`,
})
class NameRendererComponent implements ViewCell {
	@Input() value: string | number;
	@Input() rowData: any;
}

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<ng2-smart-table
			[settings]="settings"
			[source]="source"
			(userRowSelect)="selected = $event.selected"
		></ng2-smart-table>
	`,
})
class HostComponent {
	source = new LocalDataSource();
	selected: any[] = [];
	initialized: any[] = [];
	settings = {
		mode: 'external',
		selectMode: 'multi',
		actions: false,
		pager: { display: true, perPage: 2 },
		columns: {
			name: {
				title: 'Name',
				type: 'custom',
				renderComponent: NameRendererComponent,
				filter: false,
				onComponentInitFunction: (instance: any) =>
					this.initialized.push(instance),
			},
			city: { title: 'City', sort: false },
			orders: {
				title: 'Orders',
				type: 'html',
				filter: false,
				valuePrepareFunction: (_: any, row: any) =>
					`<b class="qty">${row.ordersQty}</b>`,
			},
		},
	};
}

describe('<ng2-smart-table> on angular2-smart-table', () => {
	let fixture: ComponentFixture<HostComponent>;
	let host: HostComponent;
	let el: HTMLElement;

	const rows = () => Array.from(el.querySelectorAll('tbody tr'));

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [Ng2SmartTableModule],
			declarations: [HostComponent, NameRendererComponent],
		});
		fixture = TestBed.createComponent(HostComponent);
		host = fixture.componentInstance;
		el = fixture.nativeElement;
		fixture.detectChanges();

		await host.source.load([
			{ id: 1, name: 'Store A', city: 'Sofia', ordersQty: 3 },
			{ id: 2, name: 'Store B', city: 'Varna', ordersQty: 0 },
			{ id: 3, name: 'Store C', city: 'Plovdiv', ordersQty: 7 },
		]);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	});

	it('renders the column titles and one page of rows', () => {
		const headers = Array.from(el.querySelectorAll('thead th')).map((th) =>
			th.textContent!.trim(),
		);
		expect(headers).toEqual(
			expect.arrayContaining(['Name', 'City', 'Orders']),
		);
		expect(rows()).toHaveLength(2);
	});

	it('gives custom renderers value and rowData, then calls onComponentInitFunction', () => {
		const rendered = Array.from(el.querySelectorAll('.name-renderer')).map(
			(s) => s.textContent,
		);
		expect(rendered).toEqual(['Store A (Store A)', 'Store B (Store B)']);
		expect(host.initialized[0].rowData.id).toBe(1);
	});

	it('runs valuePrepareFunction with the row data for html columns', () => {
		expect(
			Array.from(el.querySelectorAll('b.qty')).map((b) => b.textContent),
		).toEqual(['3', '0']);
	});

	it('hides the filter of filter: false columns and keeps the others', () => {
		const filters = el.querySelectorAll('thead input[placeholder]');
		expect(
			Array.from(filters).map((i) => i.getAttribute('placeholder')),
		).toEqual(['City']);
	});

	it('emits userRowSelect with the selected rows (multi select)', () => {
		const checkbox = rows()[1].querySelector<HTMLInputElement>(
			'input[type="checkbox"]',
		)!;
		checkbox.click();
		fixture.detectChanges();
		expect(host.selected.map((r) => r.id)).toEqual([2]);
	});

	it('pages through the data source', async () => {
		host.source.setPaging(2, 2);
		await fixture.whenStable();
		fixture.detectChanges();
		expect(rows()).toHaveLength(1);
		expect(el.querySelector('.name-renderer')!.textContent).toContain(
			'Store C',
		);
	});
});
