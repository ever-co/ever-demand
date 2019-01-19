import { Observable } from 'rxjs';
import InviteRequest from '../entities/InviteRequest';
import { CreateObject } from '@pyro/db/db-create-object';

interface IInviteRequestRouter {
	get(id: InviteRequest['id']): Observable<InviteRequest | null>;

	create(inviteRequest: CreateObject<InviteRequest>): Promise<InviteRequest>;
}

export default IInviteRequestRouter;
