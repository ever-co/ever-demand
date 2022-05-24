import React from 'react';
import { Button } from 'react-native-paper';

// TYPES
import { ModifyPropertiesTypes } from '../types';

// HELPERS
import { getReactComponentProps } from '../helpers/utils';

// STORE
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPreselectedProduct } from '../store/features/order';
import { getLanguage } from '../store/features/translation';

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

	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	// FUNCTIONS
	const onPressBuy = () => {
		dispatch(setPreselectedProduct(productId));
	};

	return (
		<Button {...{ ...buttonProps, onPress: onPressBuy }}>
			{LANGUAGE.PRODUCTS_VIEW.BUY_BUTTON.PRE}${amount}
			{LANGUAGE.PRODUCTS_VIEW.BUY_BUTTON.SUF}
		</Button>
	);
};

export default BuyProductBtn;
