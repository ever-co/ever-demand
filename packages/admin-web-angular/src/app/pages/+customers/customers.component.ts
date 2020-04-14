import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { UsersService } from '../../@core/data/users.service';
import { OrdersService } from '../../@core/data/orders.service';
import User from '@modules/server.common/entities/User';
import Order from '@modules/server.common/entities/Order';
import { UserMutationComponent } from '../../@shared/user/user-mutation';
import { ToasterService } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin } from 'rxjs';
import _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Rx';
import { takeUntil, first } from 'rxjs/operators';
import { getCountryName } from '@modules/server.common/entities/GeoLocation';
import { CountryRenderComponent } from './+invites/country-render/country-render.component';
import { RedirectNameComponent } from '../../@shared/render-component/name-redirect/name-redirect.component';
import { CustomerImageComponent } from '../../@shared/render-component/customer-table/customer-table/customer-image.component';
import { NotifyService } from '../../@core/services/notify/notify.service';
import { CustomerOrdersNumberComponent } from '../../@shared/render-component/customer-table/customer-orders-number/customer-orders-number.component';
import { CustomerEmailComponent } from '../../@shared/render-component/customer-email/customer-email.component';
import { CustomerPhoneComponent } from '../../@shared/render-component/customer-phone/customer-phone.component';
import { BanConfirmComponent } from '@app/@shared/user/ban-confirm';

export interface CustomerViewModel {
	id: string;
	name: string;
	image: string;
	email: string;
	phone: string;
	country: string;
	city: string;
	address: string;
	ordersQty: number;
	isBanned: boolean;
}

const perPage = 7;

@Component({
	selector: 'ea-customers',
	templateUrl: './customers.component.html',
	styleUrls: ['/customers.component.scss'],
})
export class CustomersComponent implements AfterViewInit, OnDestroy {
	private ngDestroy$ = new Subject<void>();

	static noInfoSign = '';
	public loading: boolean;
	public showBanLoading = false;

	protected customers: User[] = [];
	protected orders: Order[] = [];

	protected settingsSmartTable: object;
	protected sourceSmartTable = new LocalDataSource();

	private _selectedCustomers: CustomerViewModel[] = [];
	private dataCount: number;
	private $users;

	public _showOnlyBanned: boolean;

	constructor(
		private readonly _router: Router,
		private readonly _ordersService: OrdersService,
		private readonly _usersService: UsersService,
		private readonly _modalService: NgbModal,
		private readonly _translateService: TranslateService,
		private readonly _notifyService: NotifyService
	) {
		this._loadSettingsSmartTable();
	}

	protected get hasSelectedCustomers(): boolean {
		return this._selectedCustomers.length > 0;
	}

	ngAfterViewInit() {
		this._addCustomHTMLElements();
		this._applyTranslationOnSmartTable();
		this.smartTableChange();
		this._loadDataSmartTable();
	}

	protected selectUser(ev) {
		const userId: string = ev.data.id;
		this._router.navigate(['/customers/list' + userId]);
	}

	protected showCreateUserModal() {
		this._modalService.open(UserMutationComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'ng-custom',
			backdrop: 'static',
		});
	}

	protected selectCustomerTmp(ev) {
		this._selectedCustomers = ev.selected;
	}

	protected deleteSelectedRows() {
		const idsForDelete: string[] = this._selectedCustomers.map((w) => w.id);

		try {
			this.loading = true;
			this._usersService
				.removeByIds(idsForDelete)
				.pipe(first())
				.toPromise();
			this._selectedCustomers = [];

			this.loading = false;
			const message = `Users was removed`;
			this._notifyService.success(message);
		} catch (error) {
			let message = `Something went wrong`;
			if (error.message === 'Validation error') {
				message = error.message;
			}
			this.loading = false;
			this._notifyService.error(message);
		}
	}

	protected banSelectedRows() {
		if (this.isUserBanned) {
			this.showUnbanPopup();
		} else {
			this.showBanPopup();
		}
	}

	private showUnbanPopup() {
		const modal = this._modalService.open(BanConfirmComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'ng-custom',
			backdrop: 'static',
		});
		modal.componentInstance.user = this._selectedCustomers[0];
		modal.result
			.then(async (user) => {
				this.showBanLoading = true;
				await this._usersService.unbanUser(user.id);
				this._loadDataSmartTable();
				this.showBanLoading = false;
				this._notifyService.success(`${user.name} is unbanned!`);
			})
			.catch((_) => {});
	}

	private showBanPopup() {
		const modal = this._modalService.open(BanConfirmComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'ng-custom',
			backdrop: 'static',
		});
		modal.componentInstance.user = this._selectedCustomers[0];
		modal.result
			.then(async (user) => {
				this.showBanLoading = true;
				await this._usersService.banUser(user.id);
				this._loadDataSmartTable();
				this.showBanLoading = false;
				this._notifyService.success(`${user.name} is banned!`);
			})
			.catch((_) => {});
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CUSTOMERS_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('IMAGE'),
			getTranslate('NAME'),
			getTranslate('EMAIL'),
			getTranslate('PHONE'),
			getTranslate('COUNTRY'),
			getTranslate('CITY'),
			getTranslate('ADDRESS'),
			getTranslate('ORDERS_QTY')
		).subscribe(
			([
				id,
				image,
				name,
				email,
				phone,
				country,
				city,
				address,
				ordersQty,
			]) => {
				this.settingsSmartTable = {
					actions: false,
					selectMode: 'multi',
					columns: {
						images: {
							title: image,
							class: 'customer-image',
							type: 'custom',
							renderComponent: CustomerImageComponent,
							onComponentInitFunction: (instance) => {
								instance.redirectPage = 'customers/list';
							},
							filter: false,
						},
						name: {
							title: name,
							type: 'custom',
							renderComponent: RedirectNameComponent,
							onComponentInitFunction: (instance) => {
								instance.redirectPage = 'customers/list';
							},
						},
						email: {
							title: email,
							type: 'custom',
							renderComponent: CustomerEmailComponent,
						},
						phone: {
							title: phone,
							type: 'custom',
							renderComponent: CustomerPhoneComponent,
						},
						country: {
							title: country,
							editor: {
								type: 'custom',
								component: CountryRenderComponent,
							},
						},
						city: { title: city },
						address: { title: address },
						ordersQty: {
							title: ordersQty,
							type: 'custom',
							renderComponent: CustomerOrdersNumberComponent,
							filter: false,
						},
					},
					pager: {
						display: true,
						perPage,
					},
				};
			}
		);
	}

	private async _loadDataSmartTable(page = 1) {
		if (this.$users) {
			await this.$users.unsubscribe();
		}
		let users: User[] = [];

		const loadData = async () => {
			const usersOrders = await this._ordersService.getUsersOrdersCountInfo(
				users.map((u) => u.id)
			);

			let usersVM = users.map((user) => {
				const userOrders = usersOrders.find(
					(res) => res['id'] === user.id
				);

				return {
					id: user.id,
					image: user.image || CustomersComponent.noInfoSign,
					name:
						user.firstName && user.lastName
							? `${user.firstName} ${user.lastName}`
							: user.firstName
							? user.firstName
							: user.lastName
							? user.lastName
							: user.id,
					email: user.email || CustomersComponent.noInfoSign,
					phone: user.phone || CustomersComponent.noInfoSign,
					country:
						getCountryName(user.geoLocation.countryId).trim() ||
						CustomersComponent.noInfoSign,
					city:
						user.geoLocation.city || CustomersComponent.noInfoSign,
					address: `st. ${
						user.geoLocation.streetAddress ||
						CustomersComponent.noInfoSign
					}, hse. № ${
						user.geoLocation.house || CustomersComponent.noInfoSign
					}`,
					ordersQty: userOrders ? userOrders.ordersCount : 0,
					isBanned: user.isBanned,
				};
			});

			await this.loadDataCount();

			if (this.showOnlyBanned) {
				usersVM = usersVM.filter((user) => user.isBanned);
			}

			const usersData = new Array(this.dataCount);

			usersData.splice(perPage * (page - 1), perPage, ...usersVM);
			await this.sourceSmartTable.load(usersData);
		};

		// We call two times 'loadData'
		// This is need because in every change on one of them the server emit and we want to receive it
		this.$users = this._usersService
			.getUsers({
				skip: perPage * (page - 1),
				limit: perPage,
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (u: User[]) => {
				users = u;
				await loadData();
			});
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(() => {
				this._loadSettingsSmartTable();
			});
	}

	// This is just workaround to show some search icon on smart table, in the future maybe we must find better solution.
	private _addCustomHTMLElements(): any {
		document.querySelector(
			'tr.ng2-smart-filters > th:nth-child(1)'
		).innerHTML = '<i class="fa fa-search" style="font-size: 1.3em"/>';
	}

	private async smartTableChange() {
		this.sourceSmartTable
			.onChanged()
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (event) => {
				if (event.action === 'page') {
					const page = event.paging.page;
					this._loadDataSmartTable(page);
				}
			});
	}

	private async loadDataCount() {
		this.dataCount = await this._usersService.getCountOfUsers();
	}

	public get isOnlyOneCustomerSelected(): boolean {
		return this._selectedCustomers.length === 1;
	}

	public get isUserBanned() {
		return (
			this._selectedCustomers[0] && this._selectedCustomers[0].isBanned
		);
	}

	public set showOnlyBanned(v: boolean) {
		this._showOnlyBanned = v;
		this._loadDataSmartTable();
	}

	public get showOnlyBanned(): boolean {
		return this._showOnlyBanned;
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
