import React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const FocusAwareStatusBar: React.FC<StatusBarProps> = (props) => {
	const isFocused = useIsFocused();

	return isFocused ? <StatusBar {...props} /> : null;
};

export default FocusAwareStatusBar;
