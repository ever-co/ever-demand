import { OnInit, OnDestroy, Component } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { IPromotion } from '@modules/server.common/interfaces/IPromotion';
import { Subject } from 'rxjs';
import { PromotionService } from 'services/promotion.service';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { PromotionMutation } from '../promotion-mutation-popup/promotion-mutation';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ConfirmDeletePopupPage } from 'components/confirm-delete-popup/confirm-delete-popup';
import { ImageTableComponent } from 'components/table-components/image-table';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'promotion-table',
	templateUrl: 'promotion-table.html',
	styleUrls: ['./promotion-table.scss'],
})
export class PromotionTable implements OnInit, OnDestroy {
	settingsSmartTable: object;
	showNoPromotionsIcon: boolean = false;

	promotions: IPromotion[];

	sourceSmartTable = new LocalDataSource();
	selectedPromotions: IPromotion[];

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly promotionsService: PromotionService,
		private readonly productLocaleService: ProductLocalesService,
		private readonly translateService: TranslateService,
		private readonly toastrController: ToastController,
		public modalCtrl: ModalController
	) {}

	ngOnInit(): void {
		this._loadPromotions();
		this._applyTranslationOnSmartTable();
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	private _loadPromotions() {
		this.promotionsService
			.getAll({ warehouse: localStorage.getItem('_warehouseId') || null })
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((promotionsRes) => {
				this.promotions = promotionsRes.promotions || [];

				this._loadSettingsSmartTable();
				this._loadDataSmartTable();

				this.promotions.length === 0
					? (this.showNoPromotionsIcon = true)
					: (this.showNoPromotionsIcon = false);
			});
	}

	private _loadSettingsSmartTable() {
		this.translateService
			.get('CARRIERS_VIEW.PROMOTIONS')
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((TRANSLATE_DATA) => {
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
					columns: {
						image: {
							title: TRANSLATE_DATA.IMAGE,
							type: 'custom',
							renderComponent: ImageTableComponent,
							filter: false,
						},
						title: {
							title: TRANSLATE_DATA.TITLE,
							type: 'string',
						},
						active: {
							title: TRANSLATE_DATA.STATUS,
							type: 'html',
							valuePrepareFunction: (active) => {
								return `<span>${active ? '✔' : '✘'}</span>`;
							},
						},
						activeFrom: {
							title: TRANSLATE_DATA.ACTIVE_FROM,
							type: 'html',
							valuePrepareFunction: this.formatTableDate,
						},
						activeTo: {
							title: TRANSLATE_DATA.ACTIVE_TO,
							type: 'html',
							valuePrepareFunction: this.formatTableDate,
						},
						purchasesCount: {
							title: TRANSLATE_DATA.PURCHASES_COUNT,
							type: 'number',
						},
					},
				};
			});
	}

	async openAddPromotion() {
		const addPromotionPopup = await this.modalCtrl.create({
			component: PromotionMutation,
		});

		await addPromotionPopup.present();

		await addPromotionPopup.onDidDismiss();

		this._loadPromotions();
	}

	private _applyTranslationOnSmartTable() {
		this.translateService.onLangChange
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this._loadSettingsSmartTable();
				this._loadDataSmartTable();
			});
	}

	private _loadDataSmartTable() {
		const promotionsVM = this.promotions.map((promotion) => {
			return {
				id: promotion._id,
				image: promotion.image,
				title: this.productLocaleService.getTranslate(promotion.title),
				active: promotion.active,
				activeFrom: promotion.activeFrom,
				activeTo: promotion.activeTo,
				purchasesCount: promotion.purchasesCount,
				promotion: promotion,
			};
		});

		this.sourceSmartTable.load(promotionsVM);
	}

	async editPromotion(event: any) {
		const modal = await this.modalCtrl.create({
			component: PromotionMutation,
			componentProps: { promotion: event.data.promotion },
		});

		await modal.present();

		await modal.onDidDismiss();

		this._loadPromotions();
	}

	async deletePromotion(event: any) {
		const modal = await this.modalCtrl.create({
			component: ConfirmDeletePopupPage,
			componentProps: {
				data: event.data,
				customText: `Promotion: ${event.data.title || '-'}`,
			},
			cssClass: 'confirm-delete-wrapper',
		});

		await modal.present();

		const res = await modal.onDidDismiss();

		if (res.data) {
			const promotionId = event.data.id;

			this.promotionsService.removeByIds([promotionId]).subscribe(
				(data) => {
					this.promotions = this.promotions.filter(
						(p) => ![promotionId].includes(p._id)
					);

					this._loadDataSmartTable();
					this.presentToast('Successfully deleted promotion!');
				},
				(err) => {
					this.presentToast(err.message || 'Something went wrong!');
				}
			);
		}
	}

	private presentToast(message: string) {
		this.toastrController
			.create({
				message,
				duration: 2000,
			})
			.then((toast) => {
				toast.present();
			});
	}

	private formatTableDate(date: string) {
		const raw: Date = new Date(date);

		const formatted: string = date
			? new DatePipe('en-EN').transform(raw, 'dd-MMM-yyyy hh:mm:ss')
			: '-';

		return `<p>${formatted}</p>`;
	}
}
