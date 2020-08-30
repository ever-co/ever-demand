import { Component } from '@angular/core';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { ToasterService } from 'angular2-toaster';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';

@Component({
	templateUrl: './by-code-modal.component.html',
})
export class ByCodeModalComponent {
	public code: number;
	public location: ILocation;

	constructor(
		private readonly inviteRouter: InviteRouter,
		private readonly userAuthRouter: UserAuthRouter,
		private readonly toasterService: ToasterService,
		private readonly activeModal: NgbActiveModal
	) {}

	closeModal() {
		this.activeModal.close();
	}

	async login() {
		if (this.code > 999 && this.code < 10000 && this.location) {
			try {
				const invite = await this.inviteRouter
					.getByCode({
						location: this.location,
						inviteCode: this.code.toString(),
					})
					.pipe(first())
					.toPromise();

				if (invite) {
					const user = await this.userAuthRouter.register({
						user: {
							apartment: invite.apartment,
							geoLocation: invite.geoLocation,
						},
					});
					this.toasterService.pop(
						'success',
						`Successful logen with code`
					);
					this.activeModal.close(user);
				} else {
					this.invalidCodeToaster();
				}
			} catch (error) {
				this.toasterService.pop('error', `Error: "${error.message}"`);
			}
		} else {
			this.invalidCodeToaster();
		}
	}

	private invalidCodeToaster() {
		this.toasterService.pop('error', `Invalid code.`);
	}
}
