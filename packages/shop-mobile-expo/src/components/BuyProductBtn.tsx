import React from 'react';
import { Button } from 'react-native-paper';
import { useMutation } from '@apollo/client';

// TYPES
import type { ModifyPropertiesTypes } from '../types';
import type { MutationCreateOrderArgsInterface } from '../client/orders/argumentInterfaces';

// HELPERS
import { getReactComponentProps } from '../helpers/utils';

// APOLLO
import { CREATE_ORDER_MUTATION } from '../client/orders/mutations';

// STORE
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPreselectedProduct } from '../store/features/order';
import { getUserData } from '../store/features/user';
import { getLanguage } from '../store/features/translation';
import { showMessage } from 'react-native-flash-message';

const BUTTON_PROPS = getReactComponentProps(Button);

export interface Props {
	amount: number;
	productId: string;
	warehouseId: string;
	buttonProps: ModifyPropertiesTypes<
		typeof BUTTON_PROPS,
		{ children?: undefined }
	>;
}

const BuyProductBtn: React.FC<Props> = ({
	amount,
	warehouseId,
	productId,
	buttonProps,
}) => {
	// DISPATCHERS
	const dispatch = useAppDispatch();

	// MUTATIONS
	const [createOrder] = useMutation(CREATE_ORDER_MUTATION);

	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);

	// STATES
	const [loading, setLoading] = React.useState(false);

	// DATA
	const CREATE_ORDER_INPUT: MutationCreateOrderArgsInterface = {
		createInput: {
			warehouseId,
			products: [
				{
					count: 1,
					productId,
				},
			],
			userId: USER_DATA?.user?.user.id || '',
			orderType: 0,
			options: { autoConfirm: true },
		},
	};

	// FUNCTIONS
	const onPressBuy = () => {
		setLoading(true);
		createOrder({
			variables: CREATE_ORDER_INPUT,
			onCompleted: (TData) => {
				dispatch(setPreselectedProduct(TData.data));
				setLoading(false);
			},
			onError: (ApolloError) => {
				console.log('ApolloError ==>', ApolloError, CREATE_ORDER_INPUT);
				showMessage({
					message: ApolloError.name,
					description: ApolloError.message,
					type: 'danger',
				});
				setLoading(false);
			},
		});
	};

	return (
		<Button
			{...{ ...buttonProps, onPress: onPressBuy }}
			disabled={loading}
			loading={loading}>
			{LANGUAGE.PRODUCTS_VIEW.BUY_BUTTON.PRE}${amount}
			{LANGUAGE.PRODUCTS_VIEW.BUY_BUTTON.SUF}
		</Button>
	);
};

export default BuyProductBtn;
