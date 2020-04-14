import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Carrier from '@modules/server.common/entities/Carrier';

@Component({
	styles: [``],
	template: `
		<div class="text-center" [ngSwitch]="carrier.status">
			<span class="work" *ngSwitchCase="0">{{
				'CARRIERS_VIEW.WORKING' | translate
			}}</span>
			<span class="notWork" *ngSwitchCase="1">{{
				'CARRIERS_VIEW.NOT_WORKING' | translate
			}}</span>
			<span class="notWork" *ngSwitchCase="2">{{
				'CARRIERS_VIEW.BLOCKED' | translate
			}}</span>
			<div></div>
		</div>
	`,
})
export class StatusComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	carrier: Carrier;

	constructor() {}

	ngOnInit(): void {
		this.carrier = this.rowData.carrier;
	}
}
