import { Component, AfterViewInit, Input } from '@angular/core';
import { DefaultEditor, Cell } from 'ng2-smart-table';

import {
	Country,
	CountryName,
	countriesIdsToNamesArray,
} from '@modules/server.common/entities/GeoLocation';

@Component({
	templateUrl: './country-render.component.html',
})
export class CountryRenderComponent extends DefaultEditor
	implements AfterViewInit {
	@Input()
	cell: Cell;

	country: string;

	constructor() {
		super();
	}

	get countries(): Array<{ id: Country; name: CountryName }> {
		return countriesIdsToNamesArray;
	}

	ngAfterViewInit() {}

	onChanged(e) {}
}
