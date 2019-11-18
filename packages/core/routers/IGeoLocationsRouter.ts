interface IGeoLocationsRouter {
	getAddressByCoordinatesUsingArcGIS(
		lat: number,
		lng: number
	): Promise<any | null>;
}

export default IGeoLocationsRouter;
