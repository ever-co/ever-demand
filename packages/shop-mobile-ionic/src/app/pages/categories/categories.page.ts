import { Component, OnInit } from '@angular/core';
import { Store } from '../../services/store.service';
import { Location } from '@angular/common';
//import ICategory from '@modules/server.common/interfaces/ICategory';
import ILanguage from '@modules/server.common/interfaces/ILanguage';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
	selector: 'e-cu-categories',
	templateUrl: './categories.page.html',
	styleUrls: ['./categories.page.css'],
})
export class CategoriesPage implements OnInit {
	constructor(
		private readonly store: Store,
		private location: Location,
		private router: Router,
		public translate: TranslateService
	) {}

	ngOnInit() {}

	set category(categ: string) {
		this.store.category = categ;
		//this.location.back();
	}

	get category(): string {
		return this.store.category;
	}

	goBack() {
		this.location.back();
	}

	// TODO: not sure it's needed, before we just call 'set language` using [(ngModel)]="language"
	switchLanguage(language: string) {
		this.translate.use(language);
	}

	// TODO: not sure it's needed, before we just call 'set language` using [(ngModel)]="language"
	switchCategory(categ: string) {
		const lang = (localStorage.getItem('_language') as ILanguage) || null;
		const categories = categ;

		this.category = categories;
		this.store.category = categ;
		//this.router.navigateByUrl('/merchants');

		//let cat : ICategory = <ICategory>categ;
		//this.store.category = cat;
		//this.location.back();
		//this.category.name = categ;

		console.log('>>>>>>>>>>>>>Category is ', this.category);
	}
}
