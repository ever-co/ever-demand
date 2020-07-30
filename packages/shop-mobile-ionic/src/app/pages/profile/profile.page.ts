import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import User from '@modules/server.common/entities/User';
import IUser from '@modules/server.common/interfaces/IUser';
import { UsersService } from 'app/services/users/users.service';
import { Store } from '../../services/store.service';
import { takeUntil, first } from 'rxjs/operators';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import GeoLocation, {
	Country,
} from '@modules/server.common/entities/GeoLocation';

@Component({
	selector: 'e-cu-profile',
	templateUrl: './profile.page.html',
	styleUrls: ['./profile.page.css'],
})
export class ProfilePage implements OnInit {
	public firstName: string;
	public lastName: string;
	public email: string;
	public phone: string;
	public quarter: string;
	public city: string;
	private image: string;

	private userId: string = '';
	public currentUser: User;

	constructor(
		private store: Store,
		private location: Location,
		private usersService: UsersService,
		public userRouter: UserRouter,
		public translate: TranslateService
	) {}

	ngOnInit() {
		this.userId = this.store.userId;

		this.image = '/assets/imgs/avatar.png';
		this.loadUser();
	}

	/*
	ngAfterViewInit() {
		this.userId = this.store.userId;
		this.loadUser();
	}
*/
	goBack() {
		this.location.back();
	}

	private async loadUser() {
		const user = await this.userRouter
			.get(this.userId)
			.pipe(first())
			.toPromise();

		this.currentUser = user as User;

		if (user.image) {
			this.image = user.image;
		}

		this.firstName = user.firstName;
		this.lastName = user.lastName;
		this.phone = user.phone;
		this.email = user.email;

		this.quarter = user.geoLocation.streetAddress;
		this.city = user.geoLocation.city;

		//this.streetAddress = user.streetAddress;
	}

	private async updateUser() {
		this.currentUser.geoLocation.streetAddress = this.quarter;
		this.currentUser.geoLocation.city = this.city;

		const newUser = await this.userRouter.updateUser(
			this.userId,

			{ geoLocation: this.currentUser.geoLocation }

			/*
				{
				countryId: this.currentUser.geoLocation.countryId,
				city: this.city,
				streetAddress: this.quarter,
				house: 10,
				loc: {
					type: 'Point',
					coordinates: [this.currentUser.geoLocation.longitude, this.currentUser.geoLocation.latitude	],
				},
			} as GeoLocation
			*/
		);
	}
	/*
	private loadUser() {
		this.userId = this.store.userId;
		this.user = this.usersService.getUserById(this.userId);

		console.log('>>>>>>>>>>>>>USER ID is ', this.userId);
	}
*/
}
