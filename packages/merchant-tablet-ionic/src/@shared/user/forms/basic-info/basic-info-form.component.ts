import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	FormControl,
	AbstractControl,
} from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import User from '@modules/server.common/entities/User';
import { IUserCreateObject } from '@modules/server.common/interfaces/IUser';
import { UsersService } from '../../../../services/users.service';
import { FormHelpers } from '../../../forms/helpers';
import { AlertController } from '@ionic/angular';

export type CustomerBasicInfo = Pick<
	IUserCreateObject,
	'firstName' | 'lastName' | 'email' | 'image'
>;

@Component({
	selector: 'basic-info-form',
	styleUrls: ['./basic-info-form.component.scss'],
	templateUrl: 'basic-info-form.component.html',
})
export class BasicInfoFormComponent implements OnInit, OnDestroy {
	@Input()
	readonly form: FormGroup;
	@Input()
	userData: User;

	private _ngDestroy$ = new Subject<void>();
	private static _users: User[] = [];
	private static _user: User;

	constructor(
		private readonly _usersService: UsersService,
		public alertController: AlertController
	) {}

	get firstName() {
		return this.form.get('firstName');
	}

	get lastName() {
		return this.form.get('lastName');
	}

	get email() {
		return this.form.get('email');
	}

	get image() {
		return this.form.get('image');
	}

	ngOnInit() {
		BasicInfoFormComponent.initialize(
			this._usersService,
			this._ngDestroy$,
			this.userData
		);
		this.loadData();
	}

	deleteImg() {
		this.image.setValue('');
	}

	static initialize(
		usersService: UsersService,
		ngDestroy: Subject<void>,
		userData?: User
	) {
		usersService
			.getUsers()
			.pipe(takeUntil(ngDestroy))
			.subscribe((usersResult) => {
				this._users = usersResult;
			});

		this._user = userData;
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		const emailSearch$ = new Subject();
		let isSearchRdy = false;

		return formBuilder.group({
			firstName: [''],
			lastName: [''],
			email: [
				'',
				[
					(control: AbstractControl) =>
						control.value ? Validators.email(control) : null,
				],
				async (ctrlEmail: FormControl) => {
					if (!isSearchRdy) {
						//
						emailSearch$.pipe(debounceTime(500)).subscribe(() => {
							//
							const hasExistedEmail = this._users.some(
								(u) => u.email === ctrlEmail.value
							);
							if (
								hasExistedEmail &&
								this._user &&
								this._user.email !== ctrlEmail.value
							) {
								ctrlEmail.setErrors({ emailTaken: true });
							}
						});

						isSearchRdy = true;
					}

					if (
						isSearchRdy &&
						ctrlEmail.value &&
						ctrlEmail.value.length > 0
					) {
						emailSearch$.next();
					}
				},
			],
			image: [''],
		});
	}

	getValue(): CustomerBasicInfo {
		const basicInfo = this.form.getRawValue() as {
			firstName: string;
			lastName: string;
			email: string;
			image: string;
		};

		return {
			firstName: basicInfo.firstName,
			lastName: basicInfo.lastName,
			...(basicInfo.email ? { email: basicInfo.email } : {}),
			image: basicInfo.image,
		};
	}

	setValue<T extends CustomerBasicInfo>(basicInfo: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue({
			firstName: basicInfo.firstName ? basicInfo.firstName : '',
			lastName: basicInfo.lastName ? basicInfo.lastName : '',
			email: basicInfo.email ? basicInfo.email : '',
			image: basicInfo.image ? basicInfo.image : '',
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}

	private loadData() {
		const userData = this.userData;

		if (userData) {
			this.firstName.setValue(userData.firstName);
			this.lastName.setValue(userData.lastName);
			this.email.setValue(userData.email);
			this.image.setValue(userData.image);
		}
	}
}
