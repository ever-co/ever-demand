import { Component, ViewChild, OnInit } from '@angular/core';
import { WarehousesService } from 'app/@core/data/warehouses.service';

@Component({
	templateUrl: './warehouse-track.component.html',
	styleUrls: ['./warehouse-track.component.scss']
})
export class WarehouseTrackComponent implements OnInit {
	@ViewChild('gmap')
	gmapElement: any;
	map: google.maps.Map;

	constructor(private warehouseService: WarehousesService) {
		this.warehouseService.getAllStores().subscribe((store) => {
			console.log(store);
		});
	}

	ngOnInit(): void {
		this.showMap();
	}

	showMap() {
		const mapProp = {
			center: new google.maps.LatLng(42.642941, 23.334149),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}
}
