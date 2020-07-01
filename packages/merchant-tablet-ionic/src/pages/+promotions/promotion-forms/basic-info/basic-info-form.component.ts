import {
	Component,
	OnDestroy,
	OnInit,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IPromotion } from '@modules/server.common/interfaces/IPromotion';
import { Subject } from 'rxjs';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { takeUntil } from 'rxjs/operators';
import { result } from 'lodash';

@Component({
	selector: 'basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html',
})
export class BasicInfoFormComponent implements OnInit, OnDestroy {
	languageCode: string;

	@Input()
	readonly form: FormGroup;

	@Input()
	promotionData: IPromotion;

	@Output()
	onCompleteEvent = new EventEmitter();

	private _promotion: IPromotion | any;

	get locale() {
		return this.form.get('locale');
	}

	get title() {
		return this.form.get('title');
	}

	get activeFrom() {
		return this.form.get('activeFrom');
	}

	get activeTo() {
		return this.form.get('activeTo');
	}

	get product() {
		return this.form.get('product');
	}

	get active() {
		return this.form.get('active');
	}

	get purchasesCount() {
		return this.form.get('purchasesCount');
	}

	private _ngDestroy$ = new Subject<void>();

	ngOnInit(): void {
		//tstodo get global locale from somewhere
		this._setDefaultLocaleValue();

		this._promotion = this.promotionData || this._initPromotion();

		['title', 'description'].forEach((promotionTranslateProp) => {
			this.addLocaleMember(this._promotion[promotionTranslateProp]);
		});

		this._loadData();

		this.locale.valueChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((value) => {
				console.log(this._promotion);

				['title', 'description'].forEach((promotionTranslateProp) => {
					this.saveLocaleMember(
						promotionTranslateProp,
						this._promotion[promotionTranslateProp]
					);
				});

				['title', 'description'].forEach((promotionTranslateProp) => {
					this.addLocaleMember(
						this._promotion[promotionTranslateProp]
					);
				});

				this.languageCode = value;

				this.setValue();
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	saveLocaleMember(translateProp: string, member: ILocaleMember[]): void {
		debugger;

		const memberValue = this._getLocaleMember(member);

		if (memberValue) {
			this._promotion[translateProp].value = this[translateProp].value;
		}
	}

	addLocaleMember(member: ILocaleMember[]): void {
		const memberValue = this._getLocaleMember(member);

		if (!memberValue) {
			member.push({ locale: this.locale.value, value: '' });
		}
	}

	getValue() {
		return this.form.getRawValue();
	}

	setValue() {
		const promotionFormValue = {
			title: this._getLocaleMember(this._promotion.title)
				? this._getLocaleMember(this._promotion.title)['value']
				: '',
			description: this._getLocaleMember(this._promotion.description)
				? this._getLocaleMember(this._promotion.description)['value']
				: '',
			activeFrom: this._promotion.activeFrom || new Date(),
			activeTo: this._promotion.activeFrom || null,
			product: null,
			active: this._promotion.active || true,
			purchasesCount: this._promotion.purchasesCount || 0,
		};

		this.form.patchValue(promotionFormValue);
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		return formBuilder.group({
			locale: ['en-US'],
			title: [''],
			activeFrom: [null],
			activeTo: [null],
			product: [null],
			active: [true],
			purchasesCount: [0, Validators.min(0)],
		});
	}

	private _initPromotion() {
		return {
			title: [],
			description: [],
			activeFrom: new Date(),
			activeTo: null,
			product: null,
			active: true,
			purchasesCount: 0,
		};
	}

	private _setDefaultLocaleValue() {
		this.languageCode = 'en-US';
	}

	private _loadData() {
		if (this._promotion) {
			this.setValue();
		}
	}

	private _getLocaleMember(
		promotionMember: ILocaleMember[]
	): String | boolean {
		let resultLocale;

		if (promotionMember) {
			resultLocale = promotionMember.find((t) => {
				return t.locale === this.languageCode;
			});
		}

		return resultLocale ? resultLocale : false;
	}
}
