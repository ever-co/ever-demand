import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { takeUntil } from 'rxjs/operators';
import { Subject, forkJoin, Observable } from 'rxjs';
import User from '@modules/server.common/entities/User';
import { UsersService } from '../../services/users.service';
import { AddressComponent } from './address.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'select-add-customer',
	styleUrls: ['./select-add-customer.component.scss'],
	template: `
		<span class="select-add-customer-component">
			<div class="customers-table" *ngIf="isSelectedFromExisting">
				<ng2-smart-table
					class="smart-table"
					[settings]="settingsSmartTable"
					[source]="sourceSmartTable"
					(userRowSelect)="selectFromExisting($event)"
				>
				</ng2-smart-table>
			</div>

			<div *ngIf="!isSelectedFromExisting">
				<user-mutation
					(customerIdEmitter)="broadcastCustomerId($event)"
				></user-mutation>
			</div>
		</span>
	`,
})
export class SelectAddCustomerComponent implements OnInit {
	private ngDestroy$ = new Subject<void>();

	@Input()
	customerOptionSelected: number;

	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();

	@Output()
	customerIdEmitter = new EventEmitter<string>();

	private _noInfoSign = '';
	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _usersService: UsersService,
		private readonly _translateService: TranslateService
	) {}

	get isSelectedFromExisting() {
		return this.customerOptionSelected === 0;
	}

	ngOnInit() {
		this._setupSettingsSmartTable();
		this._loadDataSmartTable();
	}

	selectFromExisting(ev) {
		this.broadcastCustomerId(ev.data.id);
	}

	broadcastCustomerId(customerId: string) {
		this.customerIdEmitter.emit(customerId);
	}

	private _setupSettingsSmartTable() {
		const columnTitlePrefix = 'WAREHOUSE_VIEW.NEW_ORDER_VIEW.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('FULL_NAME'),
			getTranslate('EMAIL'),
			getTranslate('PHONE'),
			getTranslate('ADDRESS')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(([id, fullName, email, phone, address]) => {
				this.settingsSmartTable = {
					actions: false,
					filters: false,
					pager: {
						perPage: 3,
					},
					columns: {
						name: { title: fullName },
						email: { title: email },
						phone: { title: phone },
						address: {
							title: address,
							type: 'custom',
							renderComponent: AddressComponent,
						},
					},
				};
			});
	}

	private _loadDataSmartTable() {
		this._usersService
			.getUsers()
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((users: User[]) => {
				const formattedData = this._formatDataSmartTable(users);
				this.sourceSmartTable.load(formattedData);
			});
	}

	private _formatDataSmartTable(users: User[]) {
		return users.map((user: User) => {
			return {
				id: user.id,
				name: `
					${user.firstName || this._noInfoSign} ${user.lastName || this._noInfoSign}
				`,
				email: user.email || this._noInfoSign,
				phone: user.phone || this._noInfoSign,
				address: user.fullAddress || this._noInfoSign,
				user,
			};
		});
	}
}
