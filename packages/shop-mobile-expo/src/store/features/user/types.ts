// TYPES/INTERFACES
import type ENV from '../../../environments/model';
import { UserInterface } from '../../../types/index';
export interface UserStateType {
	data: UserInterface | null;
	isLoggedIn: boolean;
	productViewType: ENV['PRODUCTS_VIEW_TYPE'];
}
