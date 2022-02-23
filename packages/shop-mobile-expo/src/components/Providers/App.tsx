import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCustomTextInput, setCustomText } from 'react-native-global-props';
import FlashMessage from 'react-native-flash-message';

// TYPES
import type { UserStateType } from '../../store/features/user/types';

// ACTIONS & SELECTORS
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/features/user';
import { setGroup } from '../../store/features/navigation';

// CONSTANTS
import NAV_GROUPS from '../../router/groups.routes';

// HELPERS
import { isEmpty } from '../../helpers/utils';

// STYLES
import {
	CONSTANT_COLOR as CC,
	GLOBAL_STYLE as GS,
} from '../../assets/ts/styles';

// LOCAL TYPES
export interface Props {
	children: React.ReactElement<any>;
}

const AppGuard: React.FC<Props> = (props) => {
	// DISPATCHER
	const dispatch = useAppDispatch();

	// EFFECTS
	// Set default route group of the current user
	React.useEffect(() => {
		(async () => {
			const LOCAL_USER_JSON = await AsyncStorage.getItem('user');

			if (LOCAL_USER_JSON !== null && !isEmpty(LOCAL_USER_JSON)) {
				const LOCAL_USER = JSON.parse(LOCAL_USER_JSON) as UserStateType;

				console.log('LOCAL_USER ===>', LOCAL_USER);

				dispatch(setUser(LOCAL_USER));
				if (LOCAL_USER.isLoggedIn) {
					dispatch(setGroup(NAV_GROUPS.APP));
					return;
				}
			}

			return dispatch(setGroup(NAV_GROUPS.REGISTRATION));
		})();

		return () => {};
	});

	// set default config for react-native components
	React.useEffect(() => {
		setCustomTextInput({
			style: {
				...GS.FF_Nunito,
				color: CC.light,
			},
		});

		setCustomText({
			style: {
				...GS.FF_Nunito,
				color: CC.light,
			},
		});
	}, []);

	return (
		<>
			{props.children}
			<FlashMessage position='bottom' />
		</>
	);
};

export default AppGuard;
