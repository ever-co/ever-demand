import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

/** Ionic colours of the shop app (`src/theme/variables.scss`). */
export const colors = {
	primary: '#2a2c39',
	primaryLight: '#3a3d4f',
	secondary: '#bd4742',
	tertiary: '#7044ff',
	success: '#10dc60',
	balanced: '#33cd5f',
	energized: '#ffc900',
	warning: '#ffce00',
	danger: '#f04141',
	dark: '#222428',
	medium: '#989aa2',
	light: '#f4f5f8',
	black: '#000000',
	white: '#ffffff',
	overlay: 'rgba(0, 0, 0, 0.55)',
};

export const paperTheme: MD3Theme = {
	...MD3DarkTheme,
	roundness: 2,
	colors: {
		...MD3DarkTheme.colors,
		primary: colors.secondary,
		onPrimary: colors.white,
		secondary: colors.medium,
		background: colors.primary,
		surface: colors.primary,
		surfaceVariant: colors.primaryLight,
		onSurface: colors.light,
		onBackground: colors.light,
		elevation: {
			...MD3DarkTheme.colors.elevation,
			level1: colors.primaryLight,
			level2: colors.primaryLight,
			level3: colors.primaryLight,
		},
	},
};
