import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { styleVariables } from '../../../styles/variables';
import { first, map } from 'rxjs/operators';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';
import { HttpClient } from '@angular/common/http';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import User from '@modules/server.common/entities/User';
import { GeoLocationRouter } from '@modules/client.common.angular2/routers/geo-location-router.service';
import { Store } from 'app/services/store';
import { environment } from 'environments/environment';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { LocationFormComponent } from './location/location.component';
import { GeoLocationService } from 'app/services/geo-location';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'es-login-by-location',
	styleUrls: ['./byLocation.component.scss'],
	templateUrl: '/byLocation.component.html',
})
export class LoginByLocationComponent implements OnInit {
	@ViewChild('locationForm')
	public locationForm: LocationFormComponent;

	public InitUser: User;
	public userId: string;
	public email: string;

	public mapCoordEmitter = new EventEmitter<number[]>();
	public mapGeometryEmitter = new EventEmitter<any>();

	public readonly styleVariables: typeof styleVariables = styleVariables;

	public readonly toolbarDisabled = true;

	public authLogo = environment.AUTH_LOGO;

	private coordinates: ILocation;

	constructor(
		protected inviteRouter: InviteRouter,
		protected inviteRequestRouter: InviteRequestRouter,
		protected http: HttpClient,
		protected router: Router,
		protected userRouter: UserRouter,
		private activatedRoute: ActivatedRoute,
		private geoLocationRouter: GeoLocationRouter,
		private store: Store,
		private userAuthRouter: UserAuthRouter,
		private geoLocationService: GeoLocationService,
		private translateService: TranslateService
	) {
		this.loadUserData();
	}

	ngOnInit() {
		this.updateCurrentAddressByCoordinates();
	}

	async login(): Promise<void> {
		if (this.userId) {
			const readyUser = await this.userRouter.updateUser(this.userId, {
				geoLocation: this.locationForm.getCreateUserInfo().geoLocation,
				socialIds: this.InitUser ? this.InitUser.socialIds : [],
				isRegistrationCompleted: true,
				apartment: this.locationForm.apartament.value
					? this.locationForm.apartament.value.toString()
					: '0',
			});
			this.store.userId = readyUser._id;
			await this.router.navigate(['products']);
		} else {
			try {
				const invite = await this.inviteRouter
					.getByLocation({
						apartment: this.locationForm.apartament.value
							? this.locationForm.apartament.value.toString()
							: '0',
						house: this.locationForm.house.value.toString(),
						streetAddress: this.locationForm.streetAddress.value,
						city: this.locationForm.city.value,
						countryId: this.locationForm.countryId.value,
					})
					.pipe(first())
					.toPromise();
				if (invite != null) {
					await this.register(invite);
				} else {
					console.log('Creating invite request...');
					const inviteRequest = await this.locationForm.createInviteRequest();
					if (this.store.inviteSystem) {
						const currentInvite = await this.processInviteRequest(
							inviteRequest
						);
					} else {
						const inviteCurrent = await this.inviteRouter.create(
							inviteRequest
						);
						await this.register(inviteCurrent);
					}
				}
			} catch (err) {
				console.error(err);
			}
		}
	}

	onCoordinatesChanges(coords: number[]) {
		this.mapCoordEmitter.emit(coords);
	}

	onGeometrySend(geometry: any) {
		this.mapGeometryEmitter.emit(geometry);
	}

	private async register(invite) {
		const user = await this.userAuthRouter.register({
			user: {
				apartment: invite.apartment,
				email: this.email,
				geoLocation: invite.geoLocation,
			},
		});

		this.store.userId = user.id;

		this.router.navigate(['products']);
	}

	private async updateCurrentAddressByCoordinates(): Promise<boolean> {
		try {
			const coords = await this.geoLocationService.getCurrentCoords();
			this.coordinates = {
				type: 'Point',
				coordinates: [coords.latitude, coords.longitude],
			};
		} catch (error) {
			console.warn(error);
		}

		return false;
	}

	private async processInviteRequest(
		inviteRequest: InviteRequest
	): Promise<void> {
		if (inviteRequest) {
			localStorage.setItem('inviteRequestId', inviteRequest.id);
		} else {
			// TODO: show here that we can't get location and can't send invite because of that...
		}
		await this.router.navigate(['login']);
	}

	private async loadUserData() {
		this.userId = await this.activatedRoute.params
			.pipe(
				map((p) => p.id),
				first()
			)
			.toPromise();
		if (this.userId) {
			this.InitUser = await this.userRouter
				.get(this.userId)
				.pipe(first())
				.toPromise();

			this.email = this.InitUser.email;
		}
	}
}
