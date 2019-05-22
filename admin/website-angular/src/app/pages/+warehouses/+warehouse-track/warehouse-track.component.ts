import { Component, ViewChild, OnInit } from '@angular/core';
import { WarehousesService } from 'app/@core/data/warehouses.service';
import { environment } from 'environments/environment';
import { Marker } from '@agm/core/services/google-maps-types';
import Warehouse from '@modules/server.common/entities/Warehouse';
import {
	getCountryName,
	CountryName
} from '@modules/server.common/entities/GeoLocation';

@Component({
	templateUrl: './warehouse-track.component.html',
	styleUrls: ['./warehouse-track.component.scss']
})
export class WarehouseTrackComponent implements OnInit {
	@ViewChild('gmap')
	gmapElement: any;
	map: google.maps.Map;

	merchantMarkers: any[] = [];
	merchants: Warehouse[] = [];
	listOfCities: string[] = [];
	listOfCountries: CountryName[] = [];
	merchantListDropDown: Warehouse;
	merchantCity: string;
	merchantName: string;
	merchantCountry: CountryName;

	constructor(private warehouseService: WarehousesService) {}

	ngOnInit(): void {
		this.showMap();

		const warehouseService = this.warehouseService
			.getStoreLivePosition()
			.subscribe((store) => {
				if (
					!(
						this.merchantName ||
						this.merchantCity ||
						this.merchantCountry
					)
				) {
					this.merchants = store;
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
				}

				if (this.merchantMarkers.length === 0) {
					this.populateMarkers(store, this.merchantMarkers);
				} else if (store.length === this.merchantMarkers.length) {
					this.updateMarkers(store, this.merchantMarkers);
				} else {
					this.merchantMarkers.forEach((marker) => {
						marker.setMap(null);
					});
					this.merchantMarkers = [];
					this.populateMarkers(store, this.merchantMarkers);
				}
			});
	}

	showMap() {
		const mapProp = {
			center: new google.maps.LatLng(42.642941, 23.334149),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}

	filterByName(event) {
		if (event) {
			this.merchantName = event;
			this.merchantCity = undefined;
			this.merchantCountry = undefined;

			this.deleteMarkerStorage(this.merchantMarkers);

			const coords = new google.maps.LatLng(
				event.geoLocation.loc.coordinates[1],
				event.geoLocation.loc.coordinates[0]
			);
			const storeIcon = environment.MAP_MERCHANT_ICON_LINK;
			const marker = this.addMarker(coords, this.map, storeIcon);
			this.merchantMarkers.push(marker);
		} else {
			this.deleteMarkerStorage(this.merchantMarkers);

			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}

	filterByCity(event) {
		if (event) {
			this.merchantCity = event;
			this.merchantCountry = undefined;
			this.merchantName = undefined;

			this.deleteMarkerStorage(this.merchantMarkers);
			const filteredMerchants = this.merchants.filter(
				(mer) => mer.geoLocation.city === this.merchantCity
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
		} else {
			this.deleteMarkerStorage(this.merchantMarkers);
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}

	filterByCountry(event) {
		if (event) {
			this.merchantCountry = event;
			this.merchantCity = undefined;
			this.merchantName = undefined;

			this.deleteMarkerStorage(this.merchantMarkers);
			const filteredMerchants = this.merchants.filter(
				(mer) =>
					getCountryName(mer.geoLocation.countryId) ===
					this.merchantCountry
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
		} else {
			this.deleteMarkerStorage(this.merchantMarkers);
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}

	populateMarkers(merchantArray, markerStorage) {
		merchantArray.forEach((mer) => {
			const coords = new google.maps.LatLng(
				mer.geoLocation.loc.coordinates[1],
				mer.geoLocation.loc.coordinates[0]
			);
			const storeIcon = environment.MAP_MERCHANT_ICON_LINK;
			const marker = this.addMarker(coords, this.map, storeIcon);
			markerStorage.push(marker);
		});
	}

	updateMarkers(merchantArray: Warehouse[], markerStorage: any[]) {
		merchantArray.forEach((mer, index) => {
			const newCoords = new google.maps.LatLng(
				mer.geoLocation.loc.coordinates[1],
				mer.geoLocation.loc.coordinates[0]
			);

			const oldCoords = markerStorage[index].position;
			if (!newCoords.equals(oldCoords)) {
				markerStorage[index].setPosition(newCoords);
			}
		});
	}

	deleteMarkerStorage(markerStorage) {
		markerStorage.forEach((mar) => {
			mar.setMap(null);
		});
		markerStorage = [];
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon
		});
	}
}
