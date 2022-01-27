import React from 'react';
import { View, ScrollViewProps } from 'react-native';
import { Title } from 'react-native-paper';
import {
	DrawerContentScrollView,
	DrawerContentComponentProps,
} from '@react-navigation/drawer';

// CONSTANTS
import { RoutesGroupType } from '../../router/routes';

// COMPONENTS
import Icon from '../Icon';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';
import LinkItem from './Item';

// LOCAL TYPES
export type ContentProps = {
	ScrollViewProps?: ScrollViewProps;
	drawerContentProps: DrawerContentComponentProps;
	linksGroups: RoutesGroupType[];
};

const CustomDrawer: React.FC<ContentProps> = ({
	ScrollViewProps = {},
	drawerContentProps,
	linksGroups = [],
}) => {
	return (
		<DrawerContentScrollView {...ScrollViewProps}>
			{linksGroups.map((linksGroup) => (
				<View style={{ ...GS.mb2 }}>
					<View style={{ ...GS.inlineItems, ...GS.mb1 }}>
						{linksGroup?.icon && (
							<Icon
								name={linksGroup?.icon}
								size={16}
								color={CC.grayLight}
								style={{
									...GS.mr2,
								}}
							/>
						)}
						<Title style={{ fontSize: 16 }}>
							{linksGroup.title}
						</Title>
					</View>
					{linksGroup?.linkItems &&
						linksGroup.linkItems.map((linkItem) => (
							<LinkItem
								label={linkItem.label}
								path={linkItem.path}
							/>
						))}
				</View>
			))}
		</DrawerContentScrollView>
	);
};

export default CustomDrawer;
