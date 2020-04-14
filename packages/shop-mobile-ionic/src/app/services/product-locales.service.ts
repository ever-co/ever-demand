import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { environment } from 'environments/environment';

interface ProductTransientViewModel {
	title: string;
	description: string;
}

@Injectable({
	providedIn: 'root',
})
export class ProductLocalesService {
	private readonly _defaultLang: string = environment.DEFAULT_LANGUAGE;
	private readonly _defaultLocale: string = environment.DEFAULT_LOCALE;

	private _productTransientProperties: ProductTransientViewModel = {
		title: '',
		description: '',
	};

	public currentLocale: string;

	constructor(private translate: TranslateService) {}

	public get isServiceStateValid() {
		return (
			this._productTransientProperties.title !== '' &&
			this._productTransientProperties.description !== ''
		);
	}

	getTranslate(member: ILocaleMember[]): string {
		if (member !== null) {
			const productMember: ILocaleMember =
				member.find((x) =>
					x.locale.startsWith(this.translate.currentLang)
				) ||
				// Use default lang
				member.find((x) => x.locale.startsWith(this._defaultLang)) ||
				// Or first
				member[0];

			const value: string = productMember.value;

			return value;
		}
	}

	getMemberValue(productMember: ILocaleMember[]) {
		let valueMember = this._getProductLocaleMember(productMember);

		if (valueMember === undefined) {
			// Use default
			const useDefaultLocale = true;
			valueMember = this._getProductLocaleMember(
				productMember,
				useDefaultLocale
			);
		}

		if (valueMember === undefined) {
			// Or use first
			valueMember = productMember[0];
		}

		// When we create new product it has no members at all,
		// because of that we use empty string for this case
		return valueMember ? valueMember.value : '';
	}

	setMemberValue(memberKey: string, memberValue: string) {
		this._productTransientProperties[memberKey] = memberValue;
	}

	assignPropertyValue(member: ILocaleMember[], memberKey: string) {
		const memberValue = member.find((m) => m.locale === this.currentLocale);
		const memberValueToAssign = this._productTransientProperties[memberKey];

		if (memberValue !== undefined) {
			memberValue.value = memberValueToAssign;
		} else {
			const LocaleMember: ILocaleMember = {
				locale: this.currentLocale,
				value: memberValueToAssign,
			};
			member.push(LocaleMember);
		}
	}

	private _getProductLocaleMember(
		productMember: ILocaleMember[],
		defaultLocale?: boolean
	) {
		return productMember.find(
			(t) =>
				t.locale ===
				(defaultLocale ? this._defaultLocale : this.currentLocale)
		);
	}
}
