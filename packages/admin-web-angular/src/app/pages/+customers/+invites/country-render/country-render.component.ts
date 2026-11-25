import { Component, AfterViewInit, Input } from '@angular/core';
import { DefaultEditor, Cell } from '@app/@shared/smart-table';

import {
	Country,
	CountryName,
	countriesIdsToNamesArray,
} from '@modules/server.common/entities/GeoLocation';

@Component({
	standalone: false,
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

	onChanged(value: string) {
		// angular2-smart-table keeps the edited value private: write it through the cell.
		this.cell.setValue(value);
	}
}
