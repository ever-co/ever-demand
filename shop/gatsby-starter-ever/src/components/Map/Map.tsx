import React from 'react';
import PropTypes from 'prop-types';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import  config  from '../../config'

const { defaultCoordinates } = config;

const Map = withScriptjs(withGoogleMap(({coordinates}) => {
	const coords = coordinates || defaultCoordinates;
	return (
		<GoogleMap
			defaultZoom={8}
			defaultCenter={{ lat: coords[0], lng: coords[1] }}
		>
			<Marker position={{ lat: coords[0], lng: coords[1] }} />
		</GoogleMap>
	)
}
));

Map.propTypes = {
  // bla: PropTypes.string,
};

Map.defaultProps = {
  // bla: 'test',
};

export default Map;
