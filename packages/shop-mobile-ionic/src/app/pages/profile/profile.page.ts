import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import User from '@modules/server.common/entities/User';
import IUser from '@modules/server.common/interfaces/IUser';
import { UsersService } from 'app/services/users/users.service';
import { Store } from '../../services/store.service';

@Component({
	selector: 'e-cu-profile',
	templateUrl: './profile.page.html',
	styleUrls: ['./profile.page.css'],
})
export class ProfilePage implements OnInit {
	user: IUser;
	userId: string = '';

	constructor(
		private store: Store,
		private location: Location,
		private usersService: UsersService,
		public translate: TranslateService
	) {}

	ngOnInit() {}

	goBack() {
		this.location.back();
	}

}
