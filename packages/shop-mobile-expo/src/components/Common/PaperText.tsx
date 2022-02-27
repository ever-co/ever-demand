import React from 'react';
import { TextProps } from 'react-native';
import { Text } from 'react-native-paper';

type Props = TextProps;

const PaperText: React.FC<Props> = (props) => (
	<Text
		{...{ ...props }}
		onPressIn={undefined}
		onPressOut={undefined}
		android_hyphenationFrequency={undefined}>
		{props?.children}
	</Text>
);

export default PaperText;
