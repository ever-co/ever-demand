import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
	FormGroup,
	AbstractControl,
	FormBuilder,
	Validators,
} from '@angular/forms';
import Admin from '@modules/server.common/entities/Admin';
import { AdminsService } from '../../../../@core/data/admins.service';
import { first, takeUntil } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ea-account',
	styleUrls: ['/account.component.scss'],
	templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit, OnDestroy {
	private ngDestroy$ = new Subject<void>();

	public accountForm: FormGroup;
	public oldPassword: AbstractControl;
	public password: AbstractControl;
	public repeatPassword: AbstractControl;

	public oldPasswordErrorMsg: string;
	public passwordErrorMsg: string;
	public repeatPasswordErrorMsg: string;

	public PASSWORDS_DO_NOT_MATCH: string = 'PASSWORDS_DO_NOT_MATCH';
	public SUCCESSFULLY_CHANGE_PASSWORD: string =
		'SUCCESSFULLY_CHANGE_PASSWORD';
	public PREFIX: string = 'PROFILE_VIEW.';

	public loading: boolean;

	@Input()
	private admin: Admin;
	$password: any;

	constructor(
		private formBuilder: FormBuilder,
		private adminsService: AdminsService,
		private toasterService: ToasterService,
		private router: Router,
		private _translateService: TranslateService
	) {
		this.buildForm();
		this.bindFormControls();

		this.loadControls();
	}

	ngOnInit(): void {
		this.$password = this.password.valueChanges.subscribe((res) => {
			this.repeatPassword.setValue('');
		});
	}

	passwordDoNotMuch() {
		return this._translate(this.PREFIX + this.PASSWORDS_DO_NOT_MATCH);
	}

	successfullyChangePassword() {
		return this._translate(this.PREFIX + this.SUCCESSFULLY_CHANGE_PASSWORD);
	}

	async saveChanges() {
		try {
			this.loading = true;
			const res = await this.adminsService
				.updatePassword(this.admin.id, {
					new: this.password.value,
					current: this.oldPassword.value,
				})
				.pipe(first())
				.toPromise();
			if (res.errors) {
				this.toasterService.pop('error', res.errors[0].message);
			} else {
				this.toasterService.pop(
					'success',
					this.successfullyChangePassword()
				);
				this.router.navigate(['/auth/logout']);
			}
			this.loading = false;
		} catch (error) {
			this.loading = true;
			this.toasterService.pop('error', error);
			this.loading = false;
		}
	}

	buildForm() {
		this.accountForm = this.formBuilder.group({
			oldPassword: ['', Validators.required],
			password: ['', [Validators.required, Validators.minLength(4)]],
			repeatPassword: [
				'',
				[
					Validators.required,
					(control: AbstractControl) => {
						if (this.password) {
							return control.value === this.password.value
								? null
								: { validUrl: true };
						} else {
							return null;
						}
					},
				],
			],
		});
	}

	bindFormControls() {
		this.oldPassword = this.accountForm.get('oldPassword');
		this.password = this.accountForm.get('password');
		this.repeatPassword = this.accountForm.get('repeatPassword');
	}

	loadControls() {
		this.validations.oldPasswordControl();
		this.validations.passwordControl();
		this.validations.repeatPasswordControl();
	}

	// Use "errors[0]" because to show messages one by one till all are fixed
	private validations = {
		oldPasswordControl: () => {
			this.oldPassword.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.oldPasswordErrorMsg =
						(this.oldPassword.touched || this.oldPassword.dirty) &&
						this.oldPassword.errors
							? Object.keys(this.oldPassword.errors)[0]
							: '';
				});
		},
		passwordControl: () => {
			this.password.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.passwordErrorMsg =
						(this.password.touched || this.password.dirty) &&
						this.password.errors
							? Object.keys(this.password.errors)[0]
							: '';
				});
		},
		repeatPasswordControl: () => {
			this.repeatPassword.valueChanges
				.debounceTime(500)
				.pipe(takeUntil(this.ngDestroy$))
				.subscribe((value) => {
					this.repeatPasswordErrorMsg =
						(this.repeatPassword.touched ||
							this.repeatPassword.dirty) &&
						this.repeatPassword.errors
							? this.repeatPassword.errors.validUrl
								? this.passwordDoNotMuch()
								: Object.keys(this.repeatPassword.errors)[0]
							: '';
				});
		},
	};

	private _translate(key: string): string {
		let translationResult = '';

		this._translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	ngOnDestroy(): void {
		if (this.$password) {
			this.$password.unsubscribe();
		}
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
