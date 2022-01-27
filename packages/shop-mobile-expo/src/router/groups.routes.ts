// TYPES
export type GroupNameType = 'APP' | 'LOADING' | 'BLANK';
export type RoutesGroupType = {
	readonly [name in GroupNameType]: GroupNameType;
};

const ROUTE_GROUPS: RoutesGroupType = {
	APP: 'APP',
	LOADING: 'LOADING',
	BLANK: 'BLANK',
};

export default ROUTE_GROUPS;
