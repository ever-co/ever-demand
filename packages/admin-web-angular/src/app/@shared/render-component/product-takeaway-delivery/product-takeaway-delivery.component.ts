import { Component, Input } from '@angular/core';

@Component({
	styles: [
		`
			div {
				white-space: nowrap;
				padding-bottom: 4px;
			}

			div img {
				width: 40px;
				height: 40px;
			}

			.icon-closed {
				color: red;
				margin-right: 3px;
			}

			.icon-checked {
				color: green;
				margin-right: 3px;
			}
		`,
	],
	template: `
		<div
			*ngIf="
				rowData.type.isDeliveryRequired && !rowData.type.isTakeaway;
				else takeaway
			"
		>
			<div>
				<i class="ion-md-checkmark icon-checked"></i>
				{{ 'WAREHOUSE_VIEW.PRODUCTS_TAB.DELIVERY' | translate }}
			</div>
			<div>
				<i class="ion-md-close icon-closed"></i>
				{{ 'WAREHOUSE_VIEW.PRODUCTS_TAB.TAKEAWAY' | translate }}
			</div>
		</div>
		<ng-template #takeaway>
			<div
				*ngIf="
					!rowData.type.isDeliveryRequired && rowData.type.isTakeaway;
					else both
				"
			>
				<div>
					<i class="ion-md-close icon-closed"></i>
					{{ 'WAREHOUSE_VIEW.PRODUCTS_TAB.DELIVERY' | translate }}
				</div>
				<div>
					<i class="ion-md-checkmark icon-checked"></i>
					{{ 'WAREHOUSE_VIEW.PRODUCTS_TAB.TAKEAWAY' | translate }}
				</div>
			</div>
			<ng-template #both>
				<div>
					<div>
						<i class="ion-md-checkmark icon-checked"></i>
						{{ 'WAREHOUSE_VIEW.PRODUCTS_TAB.DELIVERY' | translate }}
					</div>
					<div>
						<i class="ion-md-checkmark icon-checked"></i>
						{{ 'WAREHOUSE_VIEW.PRODUCTS_TAB.TAKEAWAY' | translate }}
					</div>
				</div>
			</ng-template>
		</ng-template>
	`,
})
export class ProductTakeawayDeliveryComponent {
	@Input()
	rowData: any;

	constructor() {}
}
