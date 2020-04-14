import { Component, Input } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
	selector: 'e-cu-loaded-information',
	templateUrl: './loaded-information.component.html',
	styleUrls: ['./loaded-information.component.scss'],
})
export class LoadedInformationComponent {
	@Input()
	html: string;

	readonly appVersion = environment.VERSION;
}
