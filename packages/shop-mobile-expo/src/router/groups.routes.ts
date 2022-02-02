import { GroupNameType } from '../store/features/navigation/types';

export type RoutesGroupType = {
	readonly [name in GroupNameType]: GroupNameType;
};

const ROUTE_GROUPS: RoutesGroupType = {
	APP: 'APP',
	LOADING: 'LOADING',
	BLANK: 'BLANK',
	REGISTRATION: 'REGISTRATION',
};

export default ROUTE_GROUPS;
