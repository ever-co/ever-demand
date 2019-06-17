import {
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import countries from '../../assets/countries';
import Map from '../Map';
import styles from './GeoLogin.module.scss';

const fields = [
	['City', 'city', 'text'],
	['House Number', 'house', 'text'],
	['Street Address', 'streetAddress', 'text'],
	['Apt. #', 'apartment', 'text'],
];
const GeoLoginForm = ({ state, handleChange }) => {
	console.log(styles)
	return (
		<Box component={FormControl} width={1}>
			<InputLabel htmlFor="countryId">Country</InputLabel>
			<Select
				value={state.geoLocation.countryId}
				onChange={handleChange('countryId')}
				style={{ color: 'white' }}
				inputProps={{
					name: 'countryId',
					id: 'countryId',
				}}
			>
				{countries.map((country, i) => (
					<MenuItem value={i} key={i}>
						{' '}
						{country}{' '}
					</MenuItem>
				))}
			</Select>
			{fields.map(field => (
				<Box>
					<TextField
						id={field[1]}
						label={field[0]}
						fullWidth
						inputProps={{
							type: field[2],
							className: styles.field
						}}
						value={state[field[1]]}
						onChange={handleChange(field[1])}
						className={styles.field}
					/>
				</Box>
			))}
		</Box>
	);
};

GeoLoginForm.propTypes = {
	// bla: PropTypes.string,
};

GeoLoginForm.defaultProps = {
	// bla: 'test',
};

export default GeoLoginForm;
