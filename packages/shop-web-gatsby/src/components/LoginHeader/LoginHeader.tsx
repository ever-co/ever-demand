import React from 'react';
import { Box, Stack } from '@mui/material';
import * as styles from './LoginHeader.module.scss';

interface LoginHeaderProps {
	title: string;
	subtitle: string;
	logo: string;
}

const classes = (...names: (string | undefined)[]) =>
	names.filter(Boolean).join(' ');

/** Logo, title and slogan above the sign-up form. */
const LoginHeader = ({ title, subtitle, logo }: LoginHeaderProps) => (
	<Box sx={{ width: 1, m: 4 }}>
		<Stack
			sx={{ alignItems: 'center', justifyContent: 'center' }}
			className={classes(styles.content, styles.auth)}
		>
			<img src={logo} alt="Ever" />
			<h2 className={styles.title}>{title}</h2>
			<h2 className={classes(styles.slogan, styles.locationSlogan)}>
				{subtitle}
			</h2>
		</Stack>
	</Box>
);

export default LoginHeader;
