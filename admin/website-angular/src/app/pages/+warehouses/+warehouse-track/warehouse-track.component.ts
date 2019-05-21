import { Component, ViewChild, OnInit } from '@angular/core';
import { WarehousesService } from 'app/@core/data/warehouses.service';
import { environment } from 'environments/environment';
import { Marker } from '@agm/core/services/google-maps-types';
import Warehouse from '@modules/server.common/entities/Warehouse';

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
	merchantCity: string = '';
	merchantName: string = '';

	constructor(private warehouseService: WarehousesService) {}

	ngOnInit(): void {
		this.showMap();

		const warehouseService = this.warehouseService
			.getStoreLivePosition()
			.subscribe((store) => {
				console.log(store);
				this.merchants = store;
				this.listOfCities = Array.from(
					new Set(store.map((mer) => mer.geoLocation.city))
				);
				if (this.merchantMarkers.length === 0) {
					store.forEach((mer) => {
						const coords = new google.maps.LatLng(
							mer.geoLocation.loc.coordinates[1],
							mer.geoLocation.loc.coordinates[0]
						);
						const storeIcon = environment.MAP_MERCHANT_ICON_LINK;
						const marker = this.addMarker(
							coords,
							this.map,
							storeIcon
						);
						this.merchantMarkers.push(marker);
					});
				} else if (store.length === this.merchantMarkers.length) {
					store.forEach((mer, index) => {
						const newCoords = new google.maps.LatLng(
							mer.geoLocation.loc.coordinates[1],
							mer.geoLocation.loc.coordinates[0]
						);

						const oldCoords = this.merchantMarkers[index].position;
						if (!newCoords.equals(oldCoords)) {
							this.merchantMarkers[index].setPosition(newCoords);
						}
					});
				} else {
					this.merchantMarkers.forEach((marker) => {
						marker.setMap(null);
					});
					this.merchantMarkers = [];
					store.forEach((mer) => {
						const coords = new google.maps.LatLng(
							mer.geoLocation.loc.coordinates[1],
							mer.geoLocation.loc.coordinates[0]
						);
						const storeIcon = environment.MAP_MERCHANT_ICON_LINK;
						const marker = this.addMarker(
							coords,
							this.map,
							storeIcon
						);
						this.merchantMarkers.push(marker);
					});
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
		console.log(event);
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon
		});
	}
}
