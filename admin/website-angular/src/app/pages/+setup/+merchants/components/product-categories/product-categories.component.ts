import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ProductsCategoryService } from 'app/@core/data/productsCategory.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { BasicInfoFormComponent } from 'app/@shared/product/categories/forms/basic-info';
import { NotifyService } from 'app/@core/services/notify/notify.service';

@Component({
	selector: 'ea-merchants-setup-product-categories',
	templateUrl: './product-categories.component.html',
	styleUrls: ['./product-categories.component.scss']
})
export class SetupMerchantProductCategoriesComponent {
	@ViewChild('basicInfo')
	basicInfo: BasicInfoFormComponent;

	showCreateForm: boolean = false;

	constructor(
		private productsCategoryService: ProductsCategoryService,
		private readonly notifyService: NotifyService,
		private readonly productLocalesService: ProductLocalesService
	) {}

	async create() {
		try {
			await this.productsCategoryService
				.create(this.basicInfo.createObject)
				.pipe(first())
				.toPromise();
			const message = `Category ${this.localeTranslate(
				this.basicInfo.createObject.name
			)} is added!`;
			this.notifyService.success(message);
		} catch (err) {
			const message = `Something went wrong!`;
			this.notifyService.error(message);
		}
	}

	get isValidForm() {
		let res = false;
		if (this.basicInfo) {
			res = this.basicInfo.form.valid;
		}

		return res;
	}

	localeTranslate(member: ILocaleMember[]) {
		return this.productLocalesService.getTranslate(member);
	}
}
