import {
	Component,
	OnDestroy,
	Input,
	OnInit,
	Output,
	EventEmitter,
} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import { ProductsCategoryService } from '@app/@core/data/productsCategory.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryEditComponent } from '../category-edit';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subject, Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { ConfimationModalComponent } from '@app/@shared/confirmation-modal/confirmation-modal.component';
import { CategoryImageComponent } from './category-image.component';

interface ProductViewModel {
	id: string;
	title: string;
	description: string;
	details: string;
	images: string[];
}

@Component({
	selector: 'ea-categories-table',
	styleUrls: ['./categories-table.component.scss'],
	templateUrl: './categories-table.component.html',
})
export class CategoriesTableComponent implements OnInit, OnDestroy {
	@Input()
	selectMode = 'multi';
	@Input()
	showPerPage = 7;
	@Input()
	editWithModal = true;

	@Output()
	editRow = new EventEmitter();
	@Output()
	deleteRow = new EventEmitter();

	productsCategories: ProductsCategory[] = [];
	loading: boolean;

	confirmSub$: Subscription;

	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();

	private static noInfoSign = '';
	private _selectedCategories: ProductViewModel[] = [];
	private ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _translateService: TranslateService,
		private readonly _productsCategoryService: ProductsCategoryService,
		private readonly _productLocalesService: ProductLocalesService,
		private readonly _modalService: NgbModal,
		private readonly _notifyService: NotifyService,
		private readonly modalService: NgbModal
	) {
		this._translateService.setDefaultLang('en');
		this._translateService.use('en');
	}

	get hasSelectedCategories(): boolean {
		return this._selectedCategories.length > 0;
	}

	get selectedCategories() {
		return [...this._selectedCategories];
	}

	ngOnInit(): void {
		this._loadSettingsSmartTable();
		this._applyTranslationOnSmartTable();
	}
	edit(ev) {
		if (this.editWithModal) {
			const activeModal = this._modalService.open(CategoryEditComponent, {
				size: 'lg',
				container: 'nb-layout',
				backdrop: 'static',
			});
			const modalComponent: CategoryEditComponent =
				activeModal.componentInstance;
			modalComponent.currentCategory = ev.data;
		} else {
			this.editRow.emit(ev.data);
		}
	}

	async deleteCategory(e) {
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: ConfimationModalComponent =
			activeModal.componentInstance;

		this.confirmSub$ = await modalComponent.confirmEvent
			.pipe(takeUntil(modalComponent.ngDestroy$))
			.subscribe((dataEvent) => {
				const idsArray: any = [];
				idsArray.push(e.data.id);

				try {
					this.loading = true;

					this._productsCategoryService
						.removeByIds(idsArray)
						.pipe()
						.toPromise();

					this.loading = false;

					const message = `Category '${e.data.title}' deleted`;
					this._notifyService.success(message);

					this.deleteRow.emit(e.data);
				} catch (error) {
					this.loading = false;
					const message = `Something went wrong!`;
					this._notifyService.error(message);
				}

				modalComponent.cancel();
			});
	}

	selectCategoryTmp(ev) {
		this._selectedCategories = ev.selected;
	}

	async loadDataSmartTable(categories: ProductsCategory[]) {
		this.productsCategories = categories;
		const categoriesVM = categories.map((category) => {
			return {
				id: category.id,
				title:
					this.localeTranslate(category.name) ||
					CategoriesTableComponent.noInfoSign,
				image: category.image,
				_nameLocaleValues: category.name,
			};
		});

		this.sourceSmartTable.load(categoriesVM);
	}

	localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSettingsSmartTable();
			this.loadDataSmartTable(this.productsCategories);
		});
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CATEGORY_VIEW.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(getTranslate('IMAGE'), getTranslate('TITLE'))
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(([image, titleTr]) => {
				this.settingsSmartTable = {
					selectMode: this.selectMode,
					mode: 'external',
					actions: {
						add: false,
						position: 'left',
					},
					edit: {
						editButtonContent: '<i class="ion-md-create"></i>',
					},
					delete: {
						deleteButtonContent: '<i class="ion-md-trash"></i>',
						confirmDelete: true,
					},
					columns: {
						image: {
							title: image,
							type: 'custom',
							filter: false,
							renderComponent: CategoryImageComponent,
							width: '5%',
						},
						title: { title: titleTr },
					},
					pager: {
						display: true,
						perPage: this.showPerPage,
					},
				};
			});
	}

	ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
