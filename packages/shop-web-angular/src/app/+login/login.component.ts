import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	OnDestroy,
} from '@angular/core';
import {
	FormControl,
	FormGroupDirective,
	NgForm,
	FormBuilder,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ToolbarController } from '../app.component';
import { styleVariables } from '../../styles/variables';
import { Router } from '@angular/router';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { first } from 'rxjs/operators';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MessagePopUpComponent } from 'app/shared/message-pop-up/message-pop-up.component';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { Store } from 'app/services/store';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(
		control: FormControl | null,
		form: FormGroupDirective | NgForm | null
	): boolean {
		const isSubmitted = form && form.submitted;
		return !!(
			control &&
			control.invalid &&
			(control.dirty || control.touched || isSubmitted)
		);
	}
}

// tslint:disable-next-line:max-classes-per-file
@Component({
	selector: 'login',
	styleUrls: ['./login.component.scss'],
	templateUrl: './login.component.html',
})
export class LoginComponent implements ToolbarController, OnInit, OnDestroy {
	public HTTPS_SERVICES_ENDPOINT: string;
	public readonly styleVariables: typeof styleVariables = styleVariables;

	public msgAllowGPS: string = 'TO_BE_INVITED_ALLOW_GPS';

	public confirmPopUpButton: string = 'OK';
	public commonPopUpText: string = 'WRONG_CODE_TRY_AGAIN';
	public modalTitleText: string = 'CONFIRMATION';

	public readonly toolbarDisabled = true;

	public formControl = this.fb.group({
		code: [''],
	});

	public matcher = new MyErrorStateMatcher();
	public inviteAddress: string | null = null;

	public get isInvited() {
		return localStorage.inviteRequestId;
	}

	public authLogo = environment.AUTH_LOGO;

	private code = this.formControl.get('code');
	private _ngDestroy$ = new Subject<void>();

	@ViewChild('codeRef', { read: ElementRef })
	private codeRef: ElementRef;

	constructor(
		private readonly router: Router,
		private readonly inviteRequestRouter: InviteRequestRouter,
		private readonly fb: FormBuilder,
		protected inviteRouter: InviteRouter,
		protected userRouter: UserRouter,
		private translateService: TranslateService,
		private dialog: MatDialog,
		private userAuthRouter: UserAuthRouter,
		private store: Store
	) {
		this.addressLoad();
		this.HTTPS_SERVICES_ENDPOINT = environment.HTTPS_SERVICES_ENDPOINT;
	}

	openInvalidInviteCodeDialog(): void {
		const dialogRef = this.dialog.open(MessagePopUpComponent, {
			width: '560px',
			data: {
				modalTitle: this.modalTitleText,
				confirmButton: this.confirmPopUpButton,
				commonText: this.commonPopUpText,
			},
		});
	}

	openMsgAllowGPSDialog(): void {
		this.commonPopUpText = 'TO_BE_INVITED_ALLOW_GPS';
		const dialogRef = this.dialog.open(MessagePopUpComponent, {
			width: '560px',
			data: {
				modalTitle: this.modalTitleText,
				confirmButton: this.confirmPopUpButton,
				commonText: this.commonPopUpText,
			},
		});
	}

	getTranslate(key: string): string {
		let translationResult = '';

		this.translateService.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	ngOnInit() {
		this.onCodeInputChange();
		return;
	}

	loadByLocation() {
		this.router.navigate(['login/byLocation']);
	}

	private onCodeInputChange() {
		this.code.valueChanges.subscribe((code) => {
			if (this.code.value !== '') {
				if (code >= 1000 && code <= 9999) {
					this.onCodeInserted();
				}
				if (code > 9999) {
					this.code.setValue(`${this.code.value}`.slice(4, 5));
				}
			}
		});
	}

	private async onCodeInserted() {
		this.codeRef.nativeElement.querySelector('input').readOnly = true;
		navigator.geolocation.getCurrentPosition(
			async ({ coords }) => {
				const [longitude, latitude] = await [
					coords.longitude,
					coords.latitude,
				];
				const invite = await this.inviteRouter
					.getByCode({
						location: {
							type: 'Point',
							coordinates: [longitude, latitude],
						},
						inviteCode: this.code.value,
					})
					.pipe(first())
					.toPromise();
				this.codeRef.nativeElement.querySelector(
					'input'
				).readOnly = false;
				if (invite != null) {
					await this.register(invite);
				} else {
					this.openInvalidInviteCodeDialog();

					this.code.setValue('');
				}
			},
			(err) => {
				this.openMsgAllowGPSDialog();
				this.code.setValue('');
			}
		);
	}

	private async register(invite) {
		const user = await this.userAuthRouter.register({
			user: {
				apartment: invite.apartment,
				geoLocation: invite.geoLocation,
			},
		});

		this.store.userId = user.id;

		this.router.navigate(['products']);

		await this.router.navigate(['products']);
	}

	private addressLoad() {
		if (localStorage.inviteRequestId) {
			this.inviteRequestRouter
				.get(localStorage.inviteRequestId)
				.subscribe((result) => {
					const address = result['geoLocation']['streetAddress'];
					const houseNumber = `${result['geoLocation']['house']}${
						result['apartment'] !== '0'
							? '/' + result['apartment']
							: ''
					}`;
					const city = result['geoLocation']['city'];
					this.inviteAddress = `${address} ${houseNumber}, ${city}`;
				});
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
