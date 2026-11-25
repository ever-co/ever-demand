import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '../table-components/smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import { Store } from '../../services/store.service';
import { ExternalAppsService } from '../../services/native/external-apps.service';

@Component({
	standalone: false,
	selector: 'carrier-phone',
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<ion-icon
			*ngIf="carrier?.phone"
			name="call"
			class="call-icon icon icon-md ion-md-call"
			(click)="attemptCall($safeNavigationMigration(carrier?.phone))"
			[ngClass]="canCall ? 'can-call' : 'can-not-call'"
		>
		</ion-icon>
		<span>{{ carrier?.phone || '' }}</span>
	`,
})
export class PhoneComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;

	@Input()
	carrier: Carrier;

	constructor(
		private store: Store,
		public externalApps: ExternalAppsService,
	) {}

	ngOnInit(): void {
		if (this.rowData) {
			this.carrier = this.rowData.carrier;
		}
	}

	get canCall() {
		if (this.store.platform) {
			return (
				this.store.platform.toLocaleLowerCase() === 'android' ||
				this.store.platform.toLocaleLowerCase() === 'ios'
			);
		}
		return false;
	}

	attemptCall(phone) {
		if (this.canCall) {
			this.externalApps
				.call(phone)
				.then((res) => console.warn('Called number!', res))
				.catch((err) => console.log('Error calling number!', err));
		}
	}
}
