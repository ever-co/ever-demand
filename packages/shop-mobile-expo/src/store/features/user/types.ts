// TYPES/INTERFACES
import type ENV from '../../../environments/model';
import { NewInviteInterface } from '../../../client/invite/argumentInterfaces';
import { UserLoginInfoInterface } from '../../../types/index';

export interface UserStateType {
	data: {
		invite?: NewInviteInterface | null;
		user?: UserLoginInfoInterface | null;
	};
	isLoggedIn: boolean;
	productViewType: ENV['PRODUCTS_VIEW_TYPE'];
}
