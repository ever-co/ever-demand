import {
	Box, FilledInput,
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
		<Box style={{width: '100%'}} p={[1,2,3]}>
			<FormControl className={styles.control}
				variant="filled" fullWidth>
				<InputLabel variant={'filled'} htmlFor="countryId">Country</InputLabel>
				<Select
					input={<FilledInput name="Country" id="countryId" />}
					value={state.geoLocation.countryId}
					onChange={handleChange('countryId')}
					inputProps={{
						name: 'countryId',
						id: 'countryId',
					}}
					variant="filled"

				>
					{countries.map((country, i) => (
						<MenuItem value={i} key={i}>
							{' '}
							{country}{' '}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			{fields.map(field => (
				<Box fullWidth className={styles.control} mt={1}>
					<TextField
						id={field[1]}
						label={field[0]}
						fullWidth
						variant="filled"
						inputProps={{
							type: field[2],
						}}
						value={state[field[1]]}
						onChange={handleChange(field[1])}
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
