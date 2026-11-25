import { Component, OnInit } from '@angular/core';
import { ViewCell } from '../table-components/smart-table';
import User from '@modules/server.common/entities/User';

@Component({
	standalone: false,
	selector: 'customer-image-view',
	styleUrls: ['./image.scss'],
	template: `
		<span class="image-component">
			<img *ngIf="user?.image" src="{{ user.image }}" />
		</span>
	`,
})
export class ImageUserComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	user: User;
	constructor() {}

	ngOnInit(): void {
		this.user = this.rowData.user;
	}
}
