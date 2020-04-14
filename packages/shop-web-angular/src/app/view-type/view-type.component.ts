import { Component } from '@angular/core';
import { Store } from 'app/services/store';
import { Router } from '@angular/router';

@Component({
	selector: 'view-type',
	styleUrls: ['./view-type.component.scss'],
	templateUrl: './view-type.component.html',
})
export class ViewTypeComponent {
	listViewSpace: string;
	listViewType: string;
	viewType: string;
	showTuneButton: boolean = true;

	constructor(private store: Store, private router: Router) {
		this.listViewSpace = this.store.productListViewSpace || 'normal';
		this.listViewType = this.store.productListViewType || 'masonry';
		this.viewType = this.store.productViewType || 'list';
	}

	get isListView() {
		return this.viewType === 'list';
	}

	async listViewSpaceChange() {
		this.store.productListViewSpace = this.listViewSpace;
		await this.reload();
	}

	async listViewTypeChange() {
		this.store.productListViewType = this.listViewType;
		await this.reload();
	}

	async viewTypeChange() {
		this.store.productViewType = this.viewType;
		if (this.viewType === 'carousel') {
			this.store.productListViewType = 'grid';
			this.store.productListViewSpace = 'wide';
		}
		await this.reload();
	}

	private async reload() {
		this.showTuneButton = true;
		await this.router.navigateByUrl('reload', {
			skipLocationChange: true,
		});
		await this.router.navigateByUrl('/products');
	}
}
