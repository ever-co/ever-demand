// TYPES/INTERFACES
import type ENV from '../../../environments/model';
// import { NewInviteInterface } from '../../../client/invite/argumentInterfaces';
// import { UserInterface } from '../../../types/index';

export interface UserStateType {
	data: any;
	isLoggedIn: boolean;
	productViewType: ENV['PRODUCTS_VIEW_TYPE'];
}
