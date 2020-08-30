import {
	Component,
	OnDestroy,
	ElementRef,
	Renderer2,
	AfterViewChecked,
	OnInit,
} from '@angular/core';

import { Subject, Observable, forkJoin } from 'rxjs';
import { LocalDataSource } from 'ng2-smart-table';
import { InvitesService } from '../../../@core/data/invites.service';
import Invite from '@modules/server.common/entities/Invite';
import { takeUntil, first } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster';
import { IInviteUpdateObject } from '@modules/server.common/interfaces/IInvite';
import { IGeolocationUpdateObject } from '@modules/server.common/interfaces/IGeoLocation';
import {
	Country,
	getCountryName,
} from '@modules/server.common/entities/GeoLocation';
import { CountryRenderComponent } from './country-render/country-render.component';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfimationModalComponent } from '../../../@shared/confirmation-modal/confirmation-modal.component';

export interface InviteViewModel {
	id: string;
	country: string;
	city: string;
	address: string;
	house: string;
	apartment: string;
	invite: string;
}

const perPage = 10;

@Component({
	selector: 'ea-invites',
	templateUrl: './invites.component.html',
	styleUrls: ['/invites.component.scss'],
})
export class InvitesComponent implements OnInit, OnDestroy, AfterViewChecked {
	settingsSmartTable: object;
	sourceSmartTable = new LocalDataSource();
	loading: boolean;

	private ngDestroy$ = new Subject<void>();

	private noInfoSign = '';
	private selectedInvites: InviteViewModel[] = [];

	private addClick2: boolean;

	private dataCount: number;
	private $invites;

	constructor(
		private readonly _invitesService: InvitesService,
		private readonly _elRef: ElementRef,
		private readonly _renderer: Renderer2,
		private readonly _translateService: TranslateService,
		private readonly _notifyService: NotifyService,
		private readonly modalService: NgbModal
	) {}

	ngOnInit() {
		this._loadSettingsSmartTable();
		this._loadDataSmartTable();
		this._applyTranslationOnSmartTable();
		this.smartTableChange();
	}

	ngAfterViewChecked(): void {
		if (
			this._elRef.nativeElement.querySelector(
				'.ng2-smart-action-add-create'
			)
		) {
			const firstRow = 2;
			const columnOffset = 0;

			const td = this._renderer.createElement('td');
			const tr = this._elRef.nativeElement.getElementsByTagName('tr')[
				firstRow
			];
			const refChild = tr.childNodes[columnOffset];
			if (!this.addClick2 && tr.className !== 'ng-star-inserted') {
				this._renderer.insertBefore(tr, td, refChild);
				this.addClick2 = true;
			}
		} else {
			this.addClick2 = false;
		}
	}

	get hasSelectedInvites(): boolean {
		return this.selectedInvites.length > 0;
	}

	selectInviteTmp(ev) {
		this.selectedInvites = ev.selected;
	}

	async createConfirm(e) {
		try {
			this.loading = true;
			const createDataObject = this.inviteCreateObject(e.newData);
			const createInput = await this._invitesService.getCreateInviteObject(
				createDataObject
			);
			await this._invitesService
				.createInvite(createInput)
				.pipe(first())
				.toPromise();
			e.confirm.resolve();
			this.loading = false;
			const message = `Invite was created`;
			this._notifyService.success(message);
		} catch (error) {
			let message = `Something went wrong`;
			if (error.message === 'Validation error') {
				message = error.message;
			}
			this.loading = false;
			this._notifyService.error(message);
		}
	}

	async deleteConfirm(e) {
		const activeModal = this.modalService.open(ConfimationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const modalComponent: ConfimationModalComponent =
			activeModal.componentInstance;

		await modalComponent.confirmEvent
			.pipe(takeUntil(modalComponent.ngDestroy$))
			.subscribe((dataEvent) => {
				try {
					this.loading = true;
					this._invitesService
						.removeByIds([e.data.id])
						.pipe(first())
						.toPromise();

					this.loading = false;
					const message = `Invite was deleted`;
					this._notifyService.success(message);
					e.confirm.resolve();
				} catch (error) {
					this.loading = false;
					const message = `Something went wrong!`;
					this._notifyService.error(message);
				}

				modalComponent.cancel();
			});
	}

	async editConfirm(e) {
		try {
			this.loading = true;
			const createDataObject = this.inviteCreateObject(e.newData);
			const createInput = await this._invitesService.getCreateInviteObject(
				createDataObject
			);

			const res = await this._invitesService
				.updateInvite(e.data.id, createInput)
				.pipe(first())
				.toPromise();
			e.confirm.resolve(res);
			this.loading = false;
			const message = `Invite was updated`;
			this._notifyService.success(message);
		} catch (error) {
			this.loading = false;
			let message = `Something went wrong`;
			if (error.message === 'Validation error') {
				message = error.message;
			}
			this._notifyService.error(message);
		}
	}

	async deleteSelectedRows() {
		const idsForDelete: string[] = this.selectedInvites.map((c) => c.id);
		try {
			this.loading = true;
			await this._invitesService
				.removeByIds(idsForDelete)
				.pipe(first())
				.toPromise();

			this.loading = false;
			const message = `${idsForDelete.length} invites was deleted`;
			this._notifyService.success(message);
			this.selectedInvites = [];
		} catch (error) {
			this.loading = false;
			const message = `Something went wrong!`;
			this._notifyService.error(message);
		}
	}

	private _applyTranslationOnSmartTable() {
		this._translateService.onLangChange.subscribe(() => {
			this._loadSettingsSmartTable();
		});
	}

	private _loadSettingsSmartTable() {
		const columnTitlePrefix = 'CUSTOMERS_VIEW.SMART_TABLE_COLUMNS.';
		const getTranslate = (name: string): Observable<string | any> =>
			this._translateService.get(columnTitlePrefix + name);

		forkJoin(
			this._translateService.get('Id'),
			getTranslate('CITY'),
			getTranslate('COUNTRY'),
			getTranslate('STREET_ADDRESS'),
			getTranslate('HOUSE'),
			getTranslate('APARTMENT'),
			getTranslate('INVITE_CODE')
		)
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(
				([
					id,
					city,
					country,
					streetAddress,
					apartment,
					house,
					inviteCode,
				]) => {
					this.settingsSmartTable = {
						selectMode: 'multi',
						add: {
							addButtonContent: '<i class="ion-md-add"></i>',
							createButtonContent:
								'<i class="ion-md-checkmark"></i>',
							cancelButtonContent: '<i class="ion-md-close"></i>',
							confirmCreate: true,
						},
						edit: {
							editButtonContent: '<i class="ion-md-create"></i>',
							saveButtonContent:
								'<i class="ion-md-checkmark"></i>',
							cancelButtonContent: '<i class="ion-md-close"></i>',
							confirmSave: true,
						},
						delete: {
							deleteButtonContent: '<i class="ion-md-trash"></i>',
							confirmDelete: true,
						},
						columns: {
							country: {
								title: country,
								editor: {
									type: 'custom',
									component: CountryRenderComponent,
								},
							},
							city: { title: city },
							address: { title: streetAddress },
							house: { title: house },
							apartment: { title: apartment },
							invite: { title: inviteCode },
						},
						pager: {
							display: true,
							perPage,
						},
					};
				}
			);
	}

	private async _loadDataSmartTable(page = 1) {
		if (this.$invites) {
			await this.$invites.unsubscribe();
		}
		let invites: Invite[] = [];

		const loadData = async () => {
			const invitesVM = invites.map((invite) => {
				this.loading = false;

				return {
					country:
						getCountryName(invite.geoLocation.countryId).trim() ||
						this.noInfoSign,
					city: invite.geoLocation.city.trim() || this.noInfoSign,
					address:
						invite.geoLocation.streetAddress.trim() ||
						this.noInfoSign,
					house: invite.geoLocation.house.trim() || this.noInfoSign,
					apartment: invite.apartment.trim() || this.noInfoSign,
					invite: invite.code.trim() || this.noInfoSign,
					id: invite.id,
					geoLocation: invite.geoLocation,
				};
			});

			await this.loadDataCount();

			const invitesData = new Array(this.dataCount);

			invitesData.splice(perPage * (page - 1), perPage, ...invitesVM);

			await this.sourceSmartTable.load(invitesData);
		};

		// We call two times 'loadData'
		// This is need because in every change on one of them the server emit and we want to receive it
		this.loading = true;
		this.$invites = this._invitesService
			.getInvites({
				skip: perPage * (page - 1),
				limit: perPage,
			})
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (i: Invite[]) => {
				this.loading = true;
				invites = i;
				await loadData();
				this.loading = false;
			});
	}

	private getUpdateInviteObject(data: InviteViewModel): IInviteUpdateObject {
		const geoLocation: IGeolocationUpdateObject = {
			countryId: Country[data.country],
			city: data.city,
			streetAddress: data.address,
			house: data.house,
		};

		const invite: IInviteUpdateObject = {
			code: data.invite,
			apartment: data.apartment,
			geoLocation,
		};

		return invite;
	}

	private inviteCreateObject(data) {
		this.inviteValidation(data);
		data.apartment = data.apartment || ' ';
		return data;
	}

	private inviteValidation(data) {
		if (!data.address || !data.city || !data.country || !data.house) {
			throw new Error('Validation error');
		}
	}

	private async smartTableChange() {
		this.sourceSmartTable
			.onChanged()
			.pipe(takeUntil(this.ngDestroy$))
			.subscribe(async (event) => {
				if (event.action === 'page') {
					const page = event.paging.page;
					this._loadDataSmartTable(page);
				}
			});
	}

	private async loadDataCount() {
		this.dataCount = await this._invitesService.getCountOfInvites();
	}

	ngOnDestroy(): void {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
