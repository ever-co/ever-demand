import {
	Component,
	Input,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JsonModalComponent } from '../../json-modal/json-modal.component';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	standalone: false,
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './sumulation-json.component.html',
})
export class SimulationJsonComponent implements ViewCell, OnInit {
	@Input()
	value: string | number;

	@Input()
	rowData: any;

	hideBtn: boolean;

	constructor(
		private readonly modalService: NgbModal,
		private _productLocalesService: ProductLocalesService,
	) {}

	ngOnInit() {}

	openInfo() {
		const activeModal = this.modalService.open(JsonModalComponent, {
			size: 'lg',
			container: 'nb-layout',
			windowClass: 'simJSON',
		});

		const modalComponent: JsonModalComponent =
			activeModal.componentInstance;
		modalComponent.obj = this.rowData;
		modalComponent.title = 'Product';
		modalComponent.subTitle = this.localeTranslate(
			this.rowData.product['title'],
		);
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	openCancel() {
		// const activeModal = this.modalService.open(OrderCancelComponent, { size: 'sm', container: 'nb-layout' });
		// const modalComponent: OrderCancelComponent = activeModal.componentInstance;
		// modalComponent.orderId = this.rowData.id
	}
}
