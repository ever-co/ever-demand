import { Component } from '@angular/core';
import Admin from '@modules/server.common/entities/Admin';
import { AdminsService } from '@app/@core/data/admins.service';
import { Store } from '@app/@core/data/store.service';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ea-profile',
	styleUrls: ['/profile.component.scss'],
	templateUrl: './profile.component.html',
})
export class ProfileComponent {
	public admin$: Observable<Admin>;

	constructor(private adminsService: AdminsService, private store: Store) {
		this.admin$ = this.adminsService.getAdmin(this.store.adminId);
	}
}
