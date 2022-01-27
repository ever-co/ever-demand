// TYPES
export type RoutesNameGroupType = 'APP' | 'LOADING' | 'BLANK';
export type RouteGroupType = {
	[name in RoutesNameGroupType]: RoutesNameGroupType;
};

const ROUTE_GROUPS: RouteGroupType = {
	APP: 'APP',
	LOADING: 'LOADING',
	BLANK: 'BLANK',
};

export default ROUTE_GROUPS;
