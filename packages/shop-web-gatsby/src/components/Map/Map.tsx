import React from 'react';
import {
	GoogleMap,
	Marker,
	withGoogleMap,
	withScriptjs,
} from 'react-google-maps';

const defaultCoordinates = [
	process.env.DEFAULT_LONGITUDE,
	process.env.DEFAULT_LATITUDE,
].map((x) => parseFloat(x));

const Map = withScriptjs(
	withGoogleMap(({ coordinates }) => {
		const coords = coordinates || defaultCoordinates;
		return (
			<GoogleMap
				defaultZoom={8}
				defaultCenter={{ lat: coords[0], lng: coords[1] }}
			>
				<Marker position={{ lat: coords[0], lng: coords[1] }} />
			</GoogleMap>
		);
	}),
);

Map.propTypes = {
	// bla: PropTypes.string,
};

Map.defaultProps = {
	// bla: 'test',
};

export default Map;
