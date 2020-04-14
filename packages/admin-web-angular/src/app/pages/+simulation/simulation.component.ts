import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import User from '@modules/server.common/entities/User';
import { UserMutationComponent } from '../../@shared/user/user-mutation';
import { GeoLocationService } from '../../@core/data/geo-location.service';
import { takeUntil, first } from 'rxjs/operators';
import { Observable, Subject, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from '@app/@core/data/store.service';
import { SimulationProductsComponent } from './products/products.component';
import { WarehouseOrdersRouter } from '@modules/client.common.angular2/routers/warehouse-orders-router.service';
import Order from '@modules/server.common/entities/Order';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { InviteRequestModalComponent } from '@app/@shared/invite/invite-request/invite-request-modal.component';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import { IInviteCreateObject } from '@modules/server.common/interfaces/IInvite';
import Invite from '@modules/server.common/entities/Invite';
import { ToasterService } from 'angular2-toaster';
import { ByCodeModalComponent } from '@app/@shared/invite/by-code/by-code-modal.component';
import {
	SimulationInstructionsComponent,
	Step,
} from './instructions/instructions.component';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';

@Component({
	selector: 'ea-simulation',
	templateUrl: './simulation.component.html',
	styleUrls: ['/simulation.component.scss'],
})
export class SimulationComponent implements OnDestroy, OnInit {
	@ViewChild('productsTable', { static: true })
	productsTable: SimulationProductsComponent;

	@ViewChild('instructions')
	instructions: SimulationInstructionsComponent;

	public hasProductsForOrder: boolean;
	public inviteSystem: boolean;
	public user: User;
	public order: Order;
	public inviteRequest: InviteRequest;
	public invite: Invite;
	public loadButtons: boolean;
	public loading: boolean;
	public productsCount: number;
	public storeName: string;
	public warehouse: Warehouse;

	private _ngDestroy$ = new Subject<void>();
	private _productsInfoData: ProductInfo[] = [];

	constructor(
		private readonly _modalService: NgbModal,
		private translate: TranslateService,
		private _productLocalesService: ProductLocalesService,
		private geoLocationService: GeoLocationService,
		private store: Store,
		private readonly userRouter: UserRouter,
		private readonly warehouseOrdersRouter: WarehouseOrdersRouter,
		private readonly orderRouter: OrderRouter,
		private readonly inviteRouter: InviteRouter,
		private readonly toasterService: ToasterService,
		private readonly warehouseRouter: WarehouseRouter
	) {
		this.loadPage();
	}

	async loadPage() {
		const invitesSettings = await this.inviteRouter.getInvitesSettings();
		this.inviteSystem = invitesSettings.isEnabled;
		this.loadButtons = true;
		this._listenForEntityLocaleTranslate();
		this._startTracking();
	}

	ngOnInit(): void {
		this.selectProductsChange();
		localStorage.removeItem('simulationStartDate');
		localStorage.removeItem('simulationEndTime');
	}

	localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	async showInviteRequestModal(): Promise<void> {
		try {
			this.inviteRequest = await this._modalService.open(
				InviteRequestModalComponent,
				{
					size: 'lg',
					container: 'nb-layout',
					backdrop: 'static',
				}
			).result;
		} catch (error) {
			this.inviteRequest = null;
		}
	}

	selectProductsChange() {
		this.productsTable.selectProductsChange$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(async (res) => {
				this.productsCount = this.productsTable.selectedProducts.length;

				if (this.productsCount > 0) {
					// We are sure that all products use same warehouse for that user [0]
					const warehouseId = this.productsTable.selectedProducts[0][
						'warehouseId'
					];

					if (
						!this.warehouse ||
						(warehouseId && this.warehouse.id !== warehouseId)
					) {
						this.warehouse = await this.warehouseRouter
							.get(warehouseId)
							.pipe(first())
							.toPromise();
					}
				}

				this.hasProductsForOrder =
					this.productsTable.selectedProducts.length > 0;
			});
	}

	async orderCreate() {
		const products = this.productsTable.selectedProducts;

		this.loading = true;

		if (products.length > 0) {
			this.hasProductsForOrder = false;

			const orderProducts = products.map((p) => ({
				count: 1,
				productId: p.id,
			}));

			// We are sure that all products use same warehouse for that user [0]
			const warehouseId = products[0]['warehouseId'];

			const orderRouterOptions = {
				populateWarehouse: true,
				populateCarrier: true,
			};

			const orderCreateInput: IOrderCreateInput = {
				userId: this.user.id,
				warehouseId,
				products: orderProducts,
			};

			const order: Order = await this.warehouseOrdersRouter.create(
				orderCreateInput
			);

			this.orderRouter
				.get(order.id, orderRouterOptions)
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((o: Order) => {
					this.order = o;
				});

			this.loading = false;

			this.instructions.step = Step.Three;
		}
	}

	orderConfirm() {
		this.loading = true;
		this.order = null;
		this.instructions.step = Step.Two;
		this.productsTable.setupDataForSmartTable(this._productsInfoData);
		// this.loading = false;
	}

	async inviteUser(): Promise<void> {
		try {
			this.invite = await this.inviteRouter.create(
				this.getInviteCreateObj()
			);

			this.inviteRequest = null;

			this.instructions.inviteCode = this.invite.code;

			this.toasterService.pop(
				'success',
				`Successful invited user, your code is ${this.invite.code}`
			);
		} catch (err) {
			this.toasterService.pop(
				'error',
				`Error in invite user: "${err.message}"`
			);
		}
	}

	async createUser(): Promise<void> {
		if (this.inviteSystem) {
			return this.showByCodeModal();
		} else {
			return this.showCreateUserModal();
		}
	}

	async orderCancel(): Promise<void> {
		this.loading = true;
		await this.warehouseOrdersRouter.cancel(this.order.id);
		this.order = null;
		this.instructions.step = Step.Two;
		this.loading = false;
	}

	private getInviteCreateObj(): IInviteCreateObject {
		if (this.inviteRequest) {
			return {
				geoLocation: this.inviteRequest.geoLocation,
				apartment: this.inviteRequest.apartment,
			};
		}
		return null;
	}

	private async showCreateUserModal(): Promise<void> {
		try {
			this.user = await this._modalService.open(UserMutationComponent, {
				size: 'lg',
				container: 'nb-layout',
				backdrop: 'static',
			}).result;

			this.store.userId = this.user.id;
			this._startTracking();
		} catch (error) {
			this.user = null;
		}
	}

	private async showByCodeModal(): Promise<void> {
		try {
			const activeModal = this._modalService.open(ByCodeModalComponent, {
				size: 'sm',
				container: 'nb-layout',
			});

			const modalComponent: ByCodeModalComponent =
				activeModal.componentInstance;

			if (this.invite) {
				modalComponent.location = this.invite.geoLocation.loc;
			}

			this.user = await activeModal.result;

			this.store.userId = this.user.id;

			this.invite = null;

			this._startTracking();
		} catch (error) {
			this.user = null;
		}
	}

	private async _startTracking(): Promise<void> {
		if (this.store.userId) {
			this.user = await this.userRouter
				.get(this.store.userId)
				.pipe(first())
				.toPromise();

			const productsInfo: Observable<
				ProductInfo[]
			> = this.geoLocationService.getGeoLocationProducts(
				this.user.geoLocation
			);

			productsInfo
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe((pInfo: ProductInfo[]) => {
					pInfo = pInfo || [];
					this._productsInfoData = pInfo;
					this.productsTable.setupDataForSmartTable(pInfo);
				});

			this.instructions.step = Step.Two;
		} else {
			this.instructions.step = Step.One;
		}
	}

	private _listenForEntityLocaleTranslate() {
		this.translate.onLangChange
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this.productsTable.setupDataForSmartTable(
					this._productsInfoData
				);
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
