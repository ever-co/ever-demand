// TYPES
import { IconNameType } from '../components/Icon';

// LOCAL TYPES
export type LinkItem = {
	label: string;
	path: string;
	icon?: IconNameType;
	external?: boolean;
};
export type RoutesGroupType = {
	title: string;
	icon?: IconNameType;
	linkItems?: LinkItem[];
};

const ROUTES_GROUPS: RoutesGroupType[] = [];

export default ROUTES_GROUPS;
