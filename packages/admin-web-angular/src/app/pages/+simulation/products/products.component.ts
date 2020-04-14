import { Component, OnDestroy, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ProductImageRedirectComponent } from '@app/@shared/render-component/product-image-redirect/product-image-redirect.component';
import { forkJoin, Observable, Subject } from 'rxjs';
import { ProductTitleRedirectComponent } from '@app/@shared/render-component/product-title-redirect/product-title-redirect.component';
import { SimulationJsonComponent } from '@app/@shared/render-component/simulation-table/sumulation-json.component';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { ProductCheckboxComponent } from '@app/@shared/render-component/product-checkbox/product-checkbox';

export interface ProductViewModel {
	id: string;
	title: string;
	image: string;
}

@Component({
	selector: 'ea-simulation-products',
	templateUrl: './products.component.html',
})
export class SimulationProductsComponent implements OnDestroy {
	protected sourceSmartTable: LocalDataSource = new LocalDataSource();
	protected settingsSmartTable: object;
	private _ngDestroy$ = new Subject<void>();

	public selectedProducts: ProductViewModel[] = [];
	public selectProducts$: EventEmitter<any> = new EventEmitter();
	public selectProductsChange$: EventEmitter<any> = new EventEmitter();
	inFilter: boolean;

	constructor(private readonly _translateService: TranslateService) {
		this._loadSmartTableSettings();
		this._applyTranslationOnSmartTable();
	}

	setupDataForSmartTable(products: ProductInfo[]) {
		if (products.length > 0) {
			const data = products.map((pInfo: ProductInfo) => {
				const product = pInfo.warehouseProduct.product;
				return {
					id: product['id'],
					product,
					warehouseId: pInfo.warehouseId,
				};
			});

			this.selectProducts$
				.pipe(takeUntil(this._ngDestroy$))
				.subscribe(({ current, allData }) => {
					allData.find((d) => d.id === current['id'])[
						'checked'
					] = !current.checked;
					this.selectedProducts = allData.filter((r) => r.checked);
					if (this.selectedProducts.length !== 0) {
						const newData = data.filter(
							(d) => d['warehouseId'] === current['warehouseId']
						);
						this.sourceSmartTable.load(newData);
						this.selectProductsChange$.emit();
					} else {
						this.sourceSmartTable.load(data);
						this.selectProductsChange$.emit();
					}
				});
			this.sourceSmartTable.load(data);
		}
	}

	async selectProductTmp(ev) {
		this.selectProducts$.emit({
			current: ev.data,
			allData: ev.source.data,
		});
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSmartTableSettings();
		});
	}

	private _loadSmartTableSettings() {
		const columnTitlePrefix = 'SIMULATION_VIEW.SMART_TABLE.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			getTranslate('ID'),
			getTranslate('TITLE'),
			getTranslate('IMAGE')
		)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(([id, titleTr, image]) => {
				this.settingsSmartTable = {
					actions: false,
					hideSubHeader: true,
					// selectMode: 'multi',
					mode: 'inline',
					columns: {
						checkbox: {
							title: '',
							filter: false,
							type: 'custom',
							renderComponent: ProductCheckboxComponent,
						},
						images: {
							title: image,
							filter: false,
							renderComponent: ProductImageRedirectComponent,
							type: 'custom',
							width: '6%',
						},
						title: {
							title: titleTr,
							filter: false,
							class: 'text-left',
							renderComponent: ProductTitleRedirectComponent,
							type: 'custom',
						},
						id: {
							class: 'text-left',
							title: id,
							filter: false,
						},
						json: {
							title: 'Actions',
							width: '6%',
							filter: false,
							type: 'custom',
							renderComponent: SimulationJsonComponent,
						},
					},
					pager: {
						display: true,
						perPage: 5,
					},
				};
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
