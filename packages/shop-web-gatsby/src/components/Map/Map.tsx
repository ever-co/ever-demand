import React from 'react';
import {
	APIProvider,
	Map as GoogleMap,
	Marker,
} from '@vis.gl/react-google-maps';
import { config } from '../../config';

interface MapProps {
	/** [latitude, longitude] of the marker; the fallback location without one. */
	coords?: [number, number] | null;
	className?: string;
	apiKey?: string;
}

/**
 * The visitor's location on a Google map (@vis.gl/react-google-maps, which replaced the
 * dead react-google-maps). Without GATSBY_GOOGLE_MAPS_API_KEY it shows the coordinates
 * instead of loading the Maps API with no key.
 */
const Map = ({
	coords,
	className,
	apiKey = config.googleMapsApiKey,
}: MapProps) => {
	const [lat, lng] = coords ?? [
		config.fallbackLatitude,
		config.fallbackLongitude,
	];

	if (!apiKey) {
		return (
			<div className={className} data-testid="map-placeholder">
				{lat.toFixed(5)}, {lng.toFixed(5)}
			</div>
		);
	}

	return (
		<APIProvider apiKey={apiKey}>
			<GoogleMap
				className={className}
				defaultZoom={8}
				defaultCenter={{ lat, lng }}
				style={{ minHeight: 300 }}
			>
				<Marker position={{ lat, lng }} />
			</GoogleMap>
		</APIProvider>
	);
};

export default Map;
