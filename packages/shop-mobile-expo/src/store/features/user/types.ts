// TYPES/INTERFACES
import type ENV from '../../../environments/model';
import {
	UserLoginInfoInterface,
	NewInviteInterface,
} from '../../../client/types';

export interface UserStateType {
	data: {
		invite?: NewInviteInterface | null;
		user?: UserLoginInfoInterface | null;
	};
	isLoggedIn: boolean;
	productViewType: ENV['PRODUCTS_VIEW_TYPE'];
	orderInfoType: ENV['ORDER_INFO_TYPE'];
}
