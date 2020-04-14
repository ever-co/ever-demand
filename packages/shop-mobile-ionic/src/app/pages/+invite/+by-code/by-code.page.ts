import { Component, OnDestroy } from '@angular/core';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { Geolocation } from '@ionic-native/geolocation';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import IInvite from '@modules/server.common/interfaces/IInvite';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import Invite from '@modules/server.common/entities/Invite';
import { Store } from '../../../services/store.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { environment } from 'environments/environment';
import { OrdersService } from 'app/services/orders/orders.service';

@Component({
	selector: 'e-cu-by-code',
	templateUrl: './by-code.page.html',
	styleUrls: ['./by-code.page.scss'],
})
export class ByCodePage implements OnDestroy {
	private readonly ngDestroy$ = new Subject<void>();

	public code: number | null = null;

	get isInvited() {
		return this.store.inviteRequestId != null;
	}

	get inviteAddress() {
		return this.store.inviteAddress;
	}

	public inviteByCodeLogo: string = environment.INVITE_BY_CODE_LOGO;

	constructor(
		private readonly store: Store,
		private readonly inviteRouter: InviteRouter,
		private readonly userAuthRouter: UserAuthRouter,
		private readonly router: Router,
		private readonly _ordersService: OrdersService
	) {}

	onCodeInputKeyPress(e) {
		const currentCode = this.code;

		if (currentCode != null && currentCode >= 1000) {
			e.preventDefault();
		}
	}

	onCodeInputChange() {
		if (this.code != null) {
			if (this.code >= 1000 && this.code <= 9999) {
				this.onCodeInserted();
			}

			if (this.code > 9999) {
				this.code = parseInt(`${this.code}`.slice(0, -1), 10);
			}
		}
	}

	private _hasNewcustomer: boolean = false;

	async onCodeInserted() {
		const code = this.code;
		this.code = null;
		if (!this._hasNewcustomer) {
			const fakeInvite = environment['FAKE_INVITE'];
			if (fakeInvite && code === fakeInvite.CODE) {
				const invite: IInvite = {
					_id: fakeInvite.ID,
					geoLocation: {
						loc: {
							type: 'Point',
							coordinates: [
								environment.DEFAULT_LONGITUDE,
								environment.DEFAULT_LATITUDE,
							],
						},
						city: fakeInvite.CITY,
						postcode: fakeInvite.POSTCODE,
						streetAddress: fakeInvite.ADDRESS,
						house: fakeInvite.HOUSE,
						countryId: fakeInvite.COUNTRY_ID,
						_id: fakeInvite.ID,
						_createdAt: fakeInvite.CREATED_AT,
						_updatedAt: fakeInvite.UPDATED_AT,
					},
					apartment: fakeInvite.APARTMENT,
					code: fakeInvite.CODE.toString(),
					_createdAt: fakeInvite.CREATED_AT,
					_updatedAt: fakeInvite.UPDATED_AT,
				};

				await this.register(invite as Invite);
				this._addOrdersToNewUser();
				return;
			}

			try {
				let location: ILocation;

				try {
					const { coords } = await Geolocation.getCurrentPosition();

					location = {
						type: 'Point',
						coordinates: [coords.longitude, coords.latitude],
					};
				} catch (error) {
					console.log('Error getting location', error);
				}

				const invite = await this.inviteRouter
					.getByCode({
						location,
						inviteCode: code.toString(),
					})
					.pipe(first())
					.toPromise();

				if (invite != null) {
					await this.register(invite);
				} else {
					alert('Wrong code!');
				}
			} catch (err) {
				console.error(err);
			}
		}
	}

	async register(invite: Invite) {
		const user = await this.userAuthRouter.register({
			user: {
				apartment: invite.apartment,
				geoLocation: invite.geoLocation,
			},
		});

		this.store.userId = user.id;

		if (this.store.backToDetails) {
			this.goToDetailsPage();
			this.store.backToDetails = null;
			return;
		}
		await this.router.navigate(['/products'], { skipLocationChange: true });
		this._hasNewcustomer = true;
	}

	async goToInviteByLocation() {
		await this.router.navigateByUrl('invite/by-location');
	}

	async goToDetailsPage() {
		const id = this.store.backToDetails;
		await this.router.navigate([`/products/product-details/${id}`], {
			skipLocationChange: true,
			queryParams: {
				backUrl: '/products',
				warehouseId: this.store.warehouseId,
			},
		});
	}

	private async _addOrdersToNewUser() {
		if (this.store.userId) {
			await this._ordersService
				.generateOrdersByCustomerId(40, this.store.userId)
				.toPromise();
		}
	}

	ngOnDestroy() {
		console.warn('ByCodePage did leave');

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
