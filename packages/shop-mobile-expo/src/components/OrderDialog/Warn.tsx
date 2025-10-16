import React from 'react';
import { StyleSheet } from 'react-native';

// COMPONENTS
import { Dialog } from '../Common';

// STYLES
// import { GLOBAL_STYLE as GS } from '../../assets/ts/styles';

interface Props {
	visible: boolean;
	onDismiss: () => any;
}

const OrderWarnDialog: React.FC<Props> = ({ visible, onDismiss }) => {
	const STYLES = StyleSheet.create({
		main: {},
	});

	return (
		<Dialog
			visible={visible}
			title='Order this product?'
			style={STYLES.main}
			onDismiss={onDismiss}
		/>
	);
};

export default OrderWarnDialog;
