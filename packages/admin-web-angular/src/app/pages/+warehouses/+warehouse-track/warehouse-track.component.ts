import { Component, ViewChild, OnInit } from '@angular/core';
import { WarehousesService } from '@app/@core/data/warehouses.service';
import { environment } from 'environments/environment';
import { Marker } from '@agm/core/services/google-maps-types';
import Warehouse from '@modules/server.common/entities/Warehouse';
import {
	getCountryName,
	CountryName,
} from '@modules/server.common/entities/GeoLocation';

@Component({
	templateUrl: './warehouse-track.component.html',
	styleUrls: ['./warehouse-track.component.scss'],
})
export class WarehouseTrackComponent implements OnInit {
	@ViewChild('gmap', { static: true })
	gmapElement: any;
	map: google.maps.Map;

	merchantMarkers: any[] = [];
	merchants: Warehouse[] = [];
	listOfCities: string[] = [];
	listOfCountries: CountryName[] = [];
	listOfMerchants: string[];
	merchantCity: string;
	merchantName: string;
	merchantCountry: CountryName;

	constructor(private warehouseService: WarehousesService) {}

	ngOnInit(): void {
		this.showMap();

		const warehouseService = this.warehouseService
			.getStoreLivePosition()
			.subscribe((store) => {
				this.merchants = store;

				if (this.merchantMarkers.length === 0) {
					this.listOfCities = Array.from(
						new Set(store.map((mer) => mer.geoLocation.city))
					).sort();
					this.listOfCountries = Array.from(
						new Set(
							store.map((mer) =>
								getCountryName(mer.geoLocation.countryId)
							)
						)
					).sort();
					this.listOfMerchants = this.setSort(
						store.map((mer) => mer.name)
					);
					this.populateMarkers(store, this.merchantMarkers);
				} else if (store.length === this.merchantMarkers.length) {
					this.updateMarkers(store);
				} else {
					this.updateMarkers(store);
				}
			});
	}

	setSort(arr: any): any[] {
		return Array.from(new Set(arr)).sort();
	}

	showMap() {
		const lat = environment.DEFAULT_LATITUDE;
		const lng = environment.DEFAULT_LONGITUDE;

		const mapProp = {
			center: new google.maps.LatLng(lat, lng),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}

	filterByName(event) {
		if (event) {
			this.merchantName = event;

			this.deleteMarkerStorage();
			const filteredMerchants = this.merchants.filter(
				(mer) => mer.name === this.merchantName
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
		} else {
			this.deleteMarkerStorage();
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}

	filterByCity(event) {
		if (event) {
			this.merchantCity = event;
			this.merchantName = undefined;
			this.deleteMarkerStorage();
			const filteredMerchants = this.merchants.filter(
				(mer) => mer.geoLocation.city === this.merchantCity
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
			this.listOfMerchants = this.setSort(
				filteredMerchants.map((mer) => mer.name)
			);
		} else {
			this.deleteMarkerStorage();
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}

	filterByCountry(event) {
		if (event) {
			this.merchantCountry = event;
			this.merchantCity = undefined;
			this.merchantName = undefined;
			this.deleteMarkerStorage();
			const filteredMerchants = this.merchants.filter(
				(mer) =>
					getCountryName(mer.geoLocation.countryId) ===
					this.merchantCountry
			);
			this.listOfCities = this.setSort(
				filteredMerchants.map((mer) => mer.geoLocation.city)
			);
			this.listOfMerchants = this.setSort(
				filteredMerchants.map((mer) => mer.name)
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
		} else {
			this.deleteMarkerStorage();
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}

	populateMarkers(merchantArray, markerStorage) {
		const latlngbounds = new google.maps.LatLngBounds();

		merchantArray.forEach((mer) => {
			const coords = new google.maps.LatLng(
				mer.geoLocation.loc.coordinates[1],
				mer.geoLocation.loc.coordinates[0]
			);
			const storeIcon = environment.MAP_MERCHANT_ICON_LINK;
			const marker = this.addMarker(coords, this.map, storeIcon);
			markerStorage.push({ marker, id: mer.id });
			latlngbounds.extend(coords);
		});

		this.map.fitBounds(latlngbounds);
	}

	updateMarkers(merchantArray: Warehouse[]) {
		merchantArray.forEach((mer, index) => {
			const newCoords = new google.maps.LatLng(
				mer.geoLocation.loc.coordinates[1],
				mer.geoLocation.loc.coordinates[0]
			);
			let markerIndex;
			const marker = this.merchantMarkers.find((markerItem, i) => {
				if (markerItem.id === mer.id) {
					markerIndex = i;
					return true;
				} else {
					return false;
				}
			});
			if (marker) {
				if (!newCoords.equals(marker.marker.getPosition())) {
					this.merchantMarkers[markerIndex].marker.setPosition(
						newCoords
					);
				}
			}
		});
	}

	deleteMarkerStorage() {
		this.merchantMarkers.forEach((mar) => {
			mar.marker.setMap(null);
		});
		this.merchantMarkers = [];
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon,
		});
	}
}
