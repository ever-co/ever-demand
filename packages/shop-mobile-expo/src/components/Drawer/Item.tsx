import * as React from 'react';
import { DrawerItem } from '@react-navigation/drawer';

// TYPES
import { LinkItem } from '../../router/routes';

// COMPONENTS
import TouchableCard, { TouchableCardPropsType } from '../TouchableCard';
import Icon from '../Icon';

// STYLES
import { GLOBAL_STYLE as GS } from '../../assets/ts/styles';

const Item: React.FC<LinkItem> = ({ label, path, icon, external }) => {
	return (
		<DrawerItem
			icon={({ focused, color, size }) => (
				<Icon
					color={color}
					size={size}
					name={
						icon
						// TODO: think to use this feature (below e.g)
						//focused ? 'heart' : 'heart-outline'
					}
				/>
			)}
			label={label}
			onPress={function (): void {
				throw new Error('Function not implemented.');
			}}
		/>
	);
};

export default Item;
