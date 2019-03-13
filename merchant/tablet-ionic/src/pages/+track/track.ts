import {
	Component,
	ViewChild,
	ElementRef,
	OnDestroy,
	OnInit
} from '@angular/core';

import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierService } from '../../../src/services/carrier.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseCarriersRouter } from '@modules/client.common.angular2/routers/warehouse-carriers-router.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'page-track',
	templateUrl: 'track.html',
	styleUrls: ['./track.scss']
})
export class TrackPage implements OnInit, OnDestroy {
	@ViewChild('gmap')
	gmapElement: ElementRef;

	map: google.maps.Map;
	myLatLng = { lat: 0, lng: 0 };

	private carriers: Carrier[];
	private warehouse: Warehouse;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private carrierService: CarrierService,
		private readonly warehouseCarriersRouter: WarehouseCarriersRouter
	) {}

	ngOnInit(): void {
		this.carrierService.getAllCarriers().subscribe((carrier) => {
			this.carriers = carrier;
			this.loadMap();
		});
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	async loadMap() {
		this.warehouseCarriersRouter
			.get(this.warehouseId)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((carriers) => {
				console.log(carriers);
			});

		const mapProp = {
			center: this.myLatLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		const storeIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon21.png';

		const userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';

		const carrierIcon =
			'http://maps.google.com/mapfiles/kml/pal4/icon54.png';

		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

		this.carriers.forEach((carrier) => {
			const mylatLng = {
				lat: carrier.geoLocation.loc.coordinates[1],
				lng: carrier.geoLocation.loc.coordinates[0]
			};

			this.addMarker(mylatLng, this.map, carrierIcon);
		});

		this.addMarker(this.myLatLng, this.map, storeIcon);
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
