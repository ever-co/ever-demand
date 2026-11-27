import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ToasterService } from '@app/@core/toaster';
import { Store } from '@app/@core/data/store.service';
import {
	TenantMemberView,
	TenantsService,
} from '@app/@core/data/tenants.service';
import { AdminSessionService } from '@app/@core/tenant/admin-session.service';
import {
	INVITE_ROLES,
	memberActions,
	MemberActions,
	TenantPermissions,
	TenantRole,
} from '@app/@core/tenant/tenant-rules';
import { ConfirmationModalComponent } from '@app/@shared/confirmation-modal/confirmation-modal.component';

interface MemberRow extends TenantMemberView {
	actions: MemberActions;
	isMe: boolean;
}

/**
 * Settings → Members (DESIGN.md §3.4): the tenant's admin logins and their
 * roles. Owners and admins add members (registerAdmin with a role), change
 * roles and remove members; staff only see the list.
 */
@Component({
	standalone: false,
	selector: 'ea-members',
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './members.component.html',
})
export class MembersComponent implements OnInit {
	readonly inviteRoles = INVITE_ROLES;
	readonly permissions: TenantPermissions;
	readonly form: FormGroup;

	members: MemberRow[] = [];
	loading = true;
	busy = false;
	error: string | null = null;

	constructor(
		fb: FormBuilder,
		session: AdminSessionService,
		private readonly store: Store,
		private readonly tenants: TenantsService,
		private readonly toaster: ToasterService,
		private readonly translate: TranslateService,
		private readonly modal: NgbModal,
	) {
		this.permissions = session.permissions();
		this.form = fb.group({
			name: ['', [Validators.required, Validators.maxLength(80)]],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(8)]],
			role: ['staff' as TenantRole, Validators.required],
		});
	}

	async ngOnInit() {
		await this.load();
	}

	trackById(_: number, member: MemberRow) {
		return member.id;
	}

	async load() {
		this.loading = true;
		this.error = null;

		try {
			const myId = this.store.adminId;
			const members = (await this.tenants.members()) ?? [];

			this.members = members.map((m) => ({
				...m,
				isMe: m.id === myId,
				actions: memberActions(m, myId, this.permissions),
			}));
		} catch (err) {
			this.error = (err as Error).message;
		} finally {
			this.loading = false;
		}
	}

	async invite() {
		if (
			!this.permissions.canManageMembers ||
			this.form.invalid ||
			this.busy
		) {
			this.form.markAllAsTouched();
			return;
		}

		await this.run(async () => {
			await this.tenants.invite(this.form.value);
			this.form.reset({
				name: '',
				email: '',
				password: '',
				role: 'staff',
			});
			return 'TENANT_VIEW.MEMBERS.ADDED';
		});
	}

	async changeRole(member: MemberRow, role: TenantRole) {
		if (!member.actions.roles.includes(role) || role === member.role) {
			return;
		}

		await this.run(async () => {
			await this.tenants.setRole(member.id, role);
			return 'TENANT_VIEW.MEMBERS.ROLE_CHANGED';
		});
	}

	remove(member: MemberRow) {
		if (!member.actions.canRemove) {
			return;
		}

		const ref = this.modal.open(ConfirmationModalComponent, {
			size: 'sm',
			container: 'nb-layout',
			backdrop: 'static',
		});
		const confirm: ConfirmationModalComponent = ref.componentInstance;

		confirm.confirmEvent.pipe(first()).subscribe(async () => {
			confirm.cancel();
			await this.run(async () => {
				await this.tenants.remove(member.id);
				return 'TENANT_VIEW.MEMBERS.REMOVED';
			});
		});
	}

	/** Runs a change, tells how it went, and reloads the list. */
	private async run(change: () => Promise<string>) {
		this.busy = true;

		try {
			const message = await change();
			this.toaster.pop('success', this.translate.instant(message));
		} catch (err) {
			this.toaster.pop('error', (err as Error).message);
		} finally {
			this.busy = false;
		}

		await this.load();
	}
}
