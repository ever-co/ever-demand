import React, { useState } from 'react';
import { Box, Button, Container, MenuItem, Select } from '@mui/material';
import auth from '../auth/auth';
import Layout from '../components/layout';
import Seo from '../components/seo';

import { LOCALES } from '../utilities/locale';

/** The locale of the product texts. */
const Settings = () => {
	const [locale, setLocale] = useState(auth.getlocale());
	const [saved, setSaved] = useState(false);

	return (
		<Layout>
			<Container className="SettingsWrapper">
				<Box sx={{ m: 4, p: 4 }}>
					<Select
						value={locale}
						onChange={(event) => {
							setLocale(event.target.value);
							setSaved(false);
						}}
						inputProps={{ 'aria-label': 'Language' }}
					>
						{LOCALES.map((value) => (
							<MenuItem value={value} key={value}>
								{value}
							</MenuItem>
						))}
					</Select>
					<br />
					<br />
					<Button
						variant={'contained'}
						color={'secondary'}
						onClick={() => {
							auth.setlocale(locale);
							setSaved(true);
						}}
					>
						Save
					</Button>
					{saved && <span style={{ marginLeft: 16 }}>Saved</span>}
				</Box>
			</Container>
		</Layout>
	);
};

export const Head = () => <Seo title="Settings" />;

export default Settings;
