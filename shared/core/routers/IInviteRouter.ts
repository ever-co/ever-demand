import { Observable } from 'rxjs';
import Invite from '../entities/Invite';
import IEnterByLocation from '../interfaces/IEnterByLocation';
import IEnterByCode from '../interfaces/IEnterByCode';
import IStreetLocation from '../interfaces/IStreetLocation';
import { CreateObject } from '@pyro/db/db-create-object';

interface IInviteRouter {
	get(id: Invite['id']): Observable<Invite | null>;

	getInvitedStreetLocations(): Observable<IStreetLocation[]>;

	getByLocation(info: IEnterByLocation): Observable<Invite | null>;

	getByCode(info: IEnterByCode): Observable<Invite | null>;

	create(inviteCreateObject: CreateObject<Invite>): Promise<Invite>;

	getInvitesSettings(): Promise<{ isEnabled: boolean }>;
}

export default IInviteRouter;
