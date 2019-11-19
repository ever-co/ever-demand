import { Observable } from 'rxjs';
import Admin from '../entities/Admin';
import { CreateObject } from '@pyro/db/db-create-object';
import IAdmin from '../interfaces/IAdmin';

export interface IAdminRegistrationInput {
	admin: CreateObject<Admin>;
	password?: string;
}

export interface IAdminLoginResponse {
	admin: Admin;
	token: string;
}

interface IAdminRouter {
	get(id: Admin['id']): Observable<Admin | null>;
	register(input: IAdminRegistrationInput): Promise<Admin>;
	login(email: string, password: string): Promise<IAdminLoginResponse | null>;
	updateById(id: Admin['id'], updateObject: Partial<IAdmin>): Promise<Admin>;
}

export default IAdminRouter;
