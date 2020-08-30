import React, { useState } from 'react';
import PropTypes from 'prop-types';
import auth from '../../auth';
import { Box, Button, Container, MenuItem, Select } from '@material-ui/core';
import countries from '../../assets/countries';
import Layout from '../../components/layout';

const locales = ['en-US', 'fr', 'bg', 'he-LI', 'ru'];

const Settings = (props) => {
	const [state, setState] = useState(auth.getlocale());
	return (
		<Layout>
			<Container className="SettingsWrapper">
				<Box m={4} p={4}>
					<Select
						value={state}
						onChange={(event) => setState(event.target.value)}
					>
						{locales.map((locale, i) => (
							<MenuItem value={locale} key={i}>
								{' '}
								{locale}{' '}
							</MenuItem>
						))}
					</Select>
					<br />
					<br />
					<Button
						variant={'contained'}
						color={'secondary'}
						onClick={auth.setlocale(state)}
					>
						Save
					</Button>
				</Box>
			</Container>
		</Layout>
	);
};

Settings.propTypes = {
	// bla: PropTypes.string,
};

Settings.defaultProps = {
	// bla: 'test',
};

export default Settings;
