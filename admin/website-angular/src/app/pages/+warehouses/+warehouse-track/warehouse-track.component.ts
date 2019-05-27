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
					this.updateMarkers(store, this.merchantMarkers);
				} else {
					console.log(this.merchantMarkers);
					this.updateMarkers(
						store.filter((mer) =>
							this.listOfMerchants.includes(mer.name)
						),
						this.merchantMarkers
					);
				}
			});
	}

	setSort(arr: any): any[] {
		return Array.from(new Set(arr)).sort();
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

			this.deleteMarkerStorage(this.merchantMarkers);
			const filteredMerchants = this.merchants.filter(
				(mer) => mer.name === this.merchantName
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
		} else {
			this.deleteMarkerStorage(this.merchantMarkers);
			this.populateMarkers(this.merchants, this.merchantMarkers);
		}
	}

	filterByCity(event) {
		if (event) {
			this.merchantCity = event;
			this.merchantName = undefined;
			this.deleteMarkerStorage(this.merchantMarkers);
			const filteredMerchants = this.merchants.filter(
				(mer) => mer.geoLocation.city === this.merchantCity
			);
			this.populateMarkers(filteredMerchants, this.merchantMarkers);
			this.listOfMerchants = this.setSort(
				filteredMerchants.map((mer) => mer.name)
			);
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
			this.listOfCities = this.setSort(
				filteredMerchants.map((mer) => mer.geoLocation.city)
			);
			this.listOfMerchants = this.setSort(
				filteredMerchants.map((mer) => mer.name)
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
			markerStorage.push({ marker, id: mer.id });
		});
	}

	updateMarkers(merchantArray: Warehouse[], markerStorage: any[]) {
		merchantArray.forEach((mer, index) => {
			const newCoords = new google.maps.LatLng(
				mer.geoLocation.loc.coordinates[1],
				mer.geoLocation.loc.coordinates[0]
			);
			let markerIndex;
			const oldCoords = markerStorage.find((marker, i) => {
				if (marker.id === mer.id) {
					markerIndex = i;
					return true;
				} else {
					return false;
				}
			});
			console.log(markerIndex);
			if (!newCoords.equals(oldCoords.marker.position)) {
				markerStorage[index].marker.setPosition(newCoords);
			}
		});
	}

	deleteMarkerStorage(markerStorage) {
		markerStorage.forEach((mar) => {
			mar.marker.setMap(null);
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
