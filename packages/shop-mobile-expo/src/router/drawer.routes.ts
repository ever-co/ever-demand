// TYPES
import type { IconNameType } from "../components/Icon";

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

const ROUTES_GROUPS: RoutesGroupType[] = [
	{
		title: "",
		linkItems: [
			{
				label: "Products",
				path: "STACK/PRODUCTS",
				icon: "shoppingcart",
				external: false,
			},
		],
	},
];

export default ROUTES_GROUPS;
