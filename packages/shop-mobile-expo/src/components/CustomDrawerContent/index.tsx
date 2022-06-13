import React from 'react';
import { View, ScrollViewProps as ScrollViewProps_ } from 'react-native';
import { Title } from 'react-native-paper';
import {
	DrawerContentScrollView,
	DrawerContentComponentProps,
} from '@react-navigation/drawer';

// HELPERS
import { isEmpty } from '../../helpers/utils';

// CONSTANTS
import { DrawerRoutesGroupType } from '../../router/drawer.routes';

// COMPONENTS
import { Icon } from '../Common';
import Header from './Header';
import Item from './Item';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

// LOCAL TYPES
export interface ContentProps {
	ScrollViewProps?: ScrollViewProps_;
	drawerContentProps: DrawerContentComponentProps;
	linksGroups: DrawerRoutesGroupType[];
}

const CustomDrawer: React.FC<ContentProps> = ({
	ScrollViewProps = {},
	drawerContentProps,
	linksGroups = [],
}) => {
	const navigationState = drawerContentProps.navigation.getState();
	const currentRouteName = navigationState.routeNames[navigationState.index];

	return (
		<View style={{ ...GS.h100, position: 'relative' }}>
			<Header />

			<View style={{ flex: 1 }}>
				<DrawerContentScrollView {...ScrollViewProps}>
					{linksGroups.map((linksGroup, linksGroup_id) => (
						<View key={linksGroup_id} style={{ ...GS.mb2 }}>
							<View style={{ ...GS.inlineItems, ...GS.mb1 }}>
								{linksGroup?.icon && (
									<Icon
										name={linksGroup.icon}
										size={16}
										color={CC.grayLight}
										style={{
											...GS.mr2,
										}}
									/>
								)}
								{!isEmpty(linksGroup.title) && (
									<Title
										style={{
											...GS.ml2,
											...GS.txtCapitalize,
											fontSize: CS.FONT_SIZE,
											color: CC.gray,
										}}>
										{linksGroup.title}
									</Title>
								)}
							</View>
							{linksGroup?.linkItems &&
								linksGroup.linkItems.map(
									(linkItem, linkItem_id) => (
										<Item
											{...{
												key: linkItem_id,
												label: linkItem.label,
												path: linkItem.path,
												icon: linkItem.icon,
												focused:
													currentRouteName ===
													linkItem.path,
												external: linkItem.external,
											}}
										/>
									),
								)}
						</View>
					))}
				</DrawerContentScrollView>
			</View>
		</View>
	);
};

export default CustomDrawer;
