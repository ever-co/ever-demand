import * as React from "react";
import { DrawerItem } from "@react-navigation/drawer";

// TYPES
import { DrawerLinkItem } from "../../router/drawer.routes";

// COMPONENTS
import TouchableCard, { TouchableCardPropsType } from "../TouchableCard";
import Icon from "../Icon";

// STYLES
import { GLOBAL_STYLE as GS } from "../../assets/ts/styles";

const Item: React.FC<DrawerLinkItem> = ({ label, path, icon, external }) => {
	return (
		<DrawerItem
			icon={({ focused, color, size }) =>
				icon ? (
					<Icon
						color={color}
						size={size}
						name={
							icon
							// TODO: think to use this feature (below e.g)
							//focused ? 'heart' : 'heart-outline'
						}
					/>
				) : (
					icon
				)
			}
			label={label}
			style={{ ...GS.mx0 }}
			onPress={function (): void {
				console.warn("Function not implemented.");
			}}
		/>
	);
};

export default Item;
