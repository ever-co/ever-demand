import { createNavigationContainerRef } from '@react-navigation/native';

export type RootParamList = {
	InviteByCode: undefined;
	InviteByLocation: undefined;
	Products: undefined;
	ProductDetails: { id: string; warehouseId: string; backUrl?: string };
	OrdersHistory: undefined;
	OrderDetails: { id: string };
	OrderInfo: undefined;
	OrderTakeawayInfo: undefined;
	Merchants: undefined;
	Language: undefined;
	About: undefined;
	Help: undefined;
	Privacy: undefined;
	TermsOfUse: undefined;
	ConnectionLost: undefined;
	ServerDown: undefined;
	Maintenance: undefined;
};

export type RouteName = keyof RootParamList;

export const navigationRef = createNavigationContainerRef<RootParamList>();

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace ReactNavigation {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface RootParamList extends Readonly<import('./types').RootParamList> {}
	}
}
