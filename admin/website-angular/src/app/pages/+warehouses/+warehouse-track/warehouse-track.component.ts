import { Component, ViewChild, OnInit } from '@angular/core';
import { WarehousesService } from 'app/@core/data/warehouses.service';
import { environment } from 'environments/environment';
import { Marker } from '@agm/core/services/google-maps-types';

@Component({
	templateUrl: './warehouse-track.component.html',
	styleUrls: ['./warehouse-track.component.scss']
})
export class WarehouseTrackComponent implements OnInit {
	@ViewChild('gmap')
	gmapElement: any;
	map: google.maps.Map;

	merchantMarkers: any[] = [];

	constructor(private warehouseService: WarehousesService) {}

	ngOnInit(): void {
		this.showMap();
		this.warehouseService.getAllStores().subscribe((store) => {
			store.forEach((mer) => {
				const coords = new google.maps.LatLng(
					mer.geoLocation.loc.coordinates[1],
					mer.geoLocation.loc.coordinates[0]
				);
				const storeIcon = environment.MAP_MERCHANT_ICON_LINK;
				const marker = this.addMarker(coords, this.map, storeIcon);
				this.merchantMarkers.push(marker);
			});
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

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon
		});
	}
}
