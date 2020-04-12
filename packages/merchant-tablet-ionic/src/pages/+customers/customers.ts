import { Component, OnDestroy } from '@angular/core';
import User from '@modules/server.common/entities/User';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import Order from '@modules/server.common/entities/Order';
import { Observable, forkJoin, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { UserPhoneComponent } from '../../components/users-table/phone';
import { AddressComponent } from '../../components/users-table/address';
import { OrdersComponent } from '../../components/users-table/orders';
import { TotalComponent } from '../../components/users-table/total';
import { EmailComponent } from '../../components/users-table/email';
import { UserMutationComponent } from '../../@shared/user/mutation/user-mutation.component';
import { ImageUserComponent } from '../../components/users-table/image';
import { OrdersService } from '../../../src/services/orders.service';
import { Store } from '../../../src/services/store.service';
import { ModalController } from '@ionic/angular';
import { CustomerAddrPopupPage } from './customer-addr-popup/customer-addr-popup';
import { ConfirmDeletePopupPage } from 'components/confirm-delete-popup/confirm-delete-popup';
import { WarehouseOrdersService } from 'services/warehouse-orders.service';
import { takeUntil } from 'rxjs/operators';
import 'rxjs/add/operator/takeUntil';

@Component({
	selector: 'page-customers',
	templateUrl: 'customers.html',
	styleUrls: ['./customers.scss'],
})
export class CustomersPage implements OnDestroy {
	orders: Order[];
	users: User[];
	showNoDeliveryIcon: boolean;
	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();

	private _ngDestroy$ = new Subject<void>();
	private orders$: any;

	constructor(
		private warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly _modalCtrl: ModalController,
		private readonly _translateService: TranslateService,
		private readonly ordersService: OrdersService,
		private readonly warehouseOrdersService: WarehouseOrdersService,
		private readonly store: Store
	) {
		this.loadUsers();
		this._loadSettingsSmartTable();
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	async ionViewCanEnter() {
		const isLogged = await this.store.isLogged();

		return this.store.maintenanceMode === null && isLogged;
	}

	getUserName(user: User) {
		let name: string = '';

		if (user) {
			const firstName = user.firstName;
			const lastName = user.lastName;
			name = `${firstName ? firstName : ''} ${lastName ? lastName : ''}`;
		}

		return name.trim();
	}

	getOrdersCount(userId: string) {
		return this.orders.filter((o: Order) => o.user.id === userId).length;
	}

	getTotalPrice(userId: string) {
		const orders = this.orders
			.filter((o: Order) => o.isPaid)
			.filter((o: Order) => o.user.id === userId);
		let totalPrice = 0;
		if (orders.length > 0) {
			totalPrice = orders
				.map((o: Order) => o.totalPrice)
				.reduce((a, b) => a + b);
		}
		return totalPrice;
	}

	async showCustomerMutationModal(user?: User) {
		const modal = await this._modalCtrl.create({
			component: UserMutationComponent,
			componentProps: { user },
			cssClass: 'customer-add-wrapper',
		});

		await modal.present();

		const res = await modal.onDidDismiss();
		const userId = res.data;
		if (userId) {
			const orderCreateInput: IOrderCreateInput = {
				warehouseId: this.warehouseId,
				userId,
				products: [],
			};

			await this.warehouseOrdersRouter.create(orderCreateInput);
		}
	}

	async showAddress(e) {
		const modal = await this._modalCtrl.create({
			component: CustomerAddrPopupPage,
			componentProps: { user: e.data.user },
			cssClass: 'customer-address-popup',
		});
		await modal.present();
	}

	async deleteCustomer(e) {
		const modal = await this._modalCtrl.create({
			component: ConfirmDeletePopupPage,
			componentProps: { data: e.data },
			cssClass: 'confirm-delete-wrapper',
		});

		await modal.present();

		const res = await modal.onDidDismiss();
		if (res.data) {
			const userId = e.data.user.id;
			const storeId = this.warehouseId;

			await this.warehouseOrdersService.removeUserOrders(storeId, userId);
		}
	}

	async editCustomer(e) {
		const user = e.data.user;
		this.showCustomerMutationModal(user);
	}

	private loadUsers() {
		// Here are loaded all orders and from them get info for users
		// let loadData = (users, orders) => {
		// 	const usersVM = users.map((u: User) => {
		// 		return {
		// 			image: u.image,
		// 			name: this.getUserName(u),
		// 			user: u,
		// 			phone: u.phone,
		// 			addresses: u.geoLocation.city,
		// 			orders: this.getOrdersCount(u.id),
		// 			total: this.getTotalPrice(u.id),
		// 			allOrders: orders
		// 		};
		// 	});

		// 	this.sourceSmartTable.load(usersVM);
		// };

		// this.orders$ = this.warehouseOrdersRouter
		// 	.get(this.warehouseId, {
		// 		order: true
		// 	} as IWarehouseOrdersRouterGetOptions)
		// 	.takeUntil(this._ngDestroy$)
		// 	.subscribe((orders: Order[]) => {
		// 		this.orders = orders;

		// 		let users = orders
		// 			.filter((o: Order, i: number, self: Order[]) => {
		// 				return (
		// 					self.map((o) => o.user.id).indexOf(o.user.id) === i
		// 				);
		// 			})
		// 			.map((o) => {
		// 				let user: User = Object.assign(o.user);
		// 				return user;
		// 			});

		// 		if (users.length === 0) {
		// 			this.showNoDeliveryIcon = true;
		// 		} else {
		// 			this.showNoDeliveryIcon = false;
		// 		}

		// 		this.users = users;
		// 		console.log(users);

		// 		loadData(this.users, this.orders);
		// 	});

		const loadData = (usersInfo) => {
			const usersVM = usersInfo.map(
				(userInfo: {
					user: User;
					ordersCount: number;
					totalPrice: number;
				}) => {
					return {
						image: userInfo.user.image,
						name: this.getUserName(userInfo.user),
						user: userInfo.user,
						phone: userInfo.user.phone,
						addresses: userInfo.user.geoLocation.city,
						orders: userInfo.ordersCount,
						total: userInfo.totalPrice,
					};
				}
			);

			this.sourceSmartTable.load(usersVM);
		};

		this.ordersService
			.getOrderedUsersInfo(this.warehouseId)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(
				(
					userInfo: Array<{
						user: User;
						ordersCount: number;
						totalPrice: number;
					}>
				) => {
					userInfo.length === 0
						? (this.showNoDeliveryIcon = true)
						: (this.showNoDeliveryIcon = false);

					loadData(userInfo);
				}
			);
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CUSTOMERS_VIEW.';
		const getTranslate = (name: string): Observable<string> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('IMAGE'),
			getTranslate('NAME'),
			getTranslate('PHONE_NUMBER'),
			getTranslate('ADDRESSES'),
			getTranslate('ORDERS'),
			getTranslate('TOTAL'),
			getTranslate('E_MAIL')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(
				([image, name, phone, addresses, orders, total, email]) => {
					this.settingsSmartTable = {
						mode: 'external',
						edit: {
							editButtonContent: '<i class="fa fa-edit"></i>',
							confirmEdit: true,
						},
						delete: {
							deleteButtonContent: '<i class="fa fa-trash"></i>',
							confirmDelete: true,
						},
						actions: {
							custom: [
								{
									name: 'track',
									title: '<i class="fa fa-map-marker"></i>',
								},
							],
						},
						columns: {
							image: {
								title: image,
								type: 'custom',
								renderComponent: ImageUserComponent,
								filter: false,
							},
							name: { title: name },
							phone: {
								title: phone,
								type: 'custom',
								renderComponent: UserPhoneComponent,
							},
							addresses: {
								title: addresses,
								type: 'custom',
								renderComponent: AddressComponent,
							},
							orders: {
								title: orders,
								class: 'text-center',
								type: 'custom',
								renderComponent: OrdersComponent,
							},
							total: {
								title: total,
								class: 'text-center',
								type: 'custom',
								renderComponent: TotalComponent,
							},
							email: {
								title: email,
								class: 'text-center',
								filter: false,
								type: 'custom',
								renderComponent: EmailComponent,
							},
						},
						pager: {
							display: true,
							perPage: 14,
						},
					};
				}
			);
	}

	ionViewWillLeave() {
		if (this.orders$) {
			this.orders$.unsubscribe();
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
