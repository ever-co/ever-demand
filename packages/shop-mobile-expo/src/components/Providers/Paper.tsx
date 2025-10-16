import React from 'react';
import { DefaultTheme, Provider } from 'react-native-paper';

// COMPONENTS
import { Icon } from '../Common';

// STYLES
import {
	CONSTANT_COLOR as CC,
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

// LOCAL TYPES
export interface Props {
	children: React.ReactElement<any>;
}
export type PaperThemeType = typeof DefaultTheme;

const PAPER_THEME: PaperThemeType = {
	...DefaultTheme,
	dark: false,
	mode: 'adaptive',
	roundness: CS.SPACE_SM - 2,
	colors: {
		...DefaultTheme.colors,
		primary: CC.secondary,
		accent: CC.secondaryLight,
		background: CC.primary,
		surface: CC.white,
		onSurface: CC.grayHighLight,
		disabled: CC.grayLight,
		text: CC.light,
		placeholder: CC.grayLight,
		error: CC.danger,
	},
	fonts: {
		thin: GS.FF_NunitoExtraLight,
		light: GS.FF_NunitoLight,
		regular: GS.FF_Nunito,
		medium: GS.FF_NunitoSemiBold,
	},
};

const PaperProvider: React.FC<Props> = (props) => {
	return (
		<Provider
			theme={PAPER_THEME}
			settings={{ icon: (iconProps: any) => <Icon {...iconProps} /> }}>
			{props.children}
		</Provider>
	);
};

export default PaperProvider;
