// TYPES/INTERFACES
import type ENV from '../../../environments/model';

export interface UserStateType {
	data: any;
	isLoggedIn: boolean;
	productViewType: ENV['PRODUCTS_VIEW_TYPE'];
}
