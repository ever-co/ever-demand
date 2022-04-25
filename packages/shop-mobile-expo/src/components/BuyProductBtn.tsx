import React from 'react';
import { Button } from 'react-native-paper';

// TYPES
import { ModifyPropertiesTypes } from '../types';

// HELPERS
import { getReactComponentProps } from '../helpers/utils';

// STORE
import { useAppDispatch } from '../store/hooks';
import { setPreselectedProduct } from '../store/features/order';

const BUTTON_PROPS = getReactComponentProps(Button);

interface Props {
	amount: number;
	productId: string;
	buttonProps: ModifyPropertiesTypes<
		typeof BUTTON_PROPS,
		{ children?: undefined }
	>;
}

const BuyProductBtn: React.FC<Props> = ({ amount, productId, buttonProps }) => {
	// DISPATCHERS
	const dispatch = useAppDispatch();

	// FUNCTIONS
	const onPressBuy = () => {
		dispatch(setPreselectedProduct(productId));
	};

	return (
		<Button {...{ ...buttonProps, onPress: onPressBuy }}>
			Buy for ${amount}
		</Button>
	);
};

export default BuyProductBtn;
