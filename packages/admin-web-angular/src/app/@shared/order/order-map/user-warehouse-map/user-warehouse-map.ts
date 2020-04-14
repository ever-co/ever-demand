import {
	Component,
	ViewChild,
	ElementRef,
	Input,
	OnDestroy,
	OnChanges,
	AfterViewInit,
} from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { environment } from 'environments/environment';

const warehouseIcon = environment.MAP_MERCHANT_ICON_LINK;
const userIcon = environment.MAP_USER_ICON_LINK;

@Component({
	selector: 'ea-user-warehouse-location',
	template: ` <div style="height:100%" #gmap></div> `,
})
export class UserWarehouseLocationComponent
	implements AfterViewInit, OnDestroy, OnChanges {
	@ViewChild('gmap', { static: true })
	gmapElement: ElementRef;

	public map: google.maps.Map;

	public userMarker: any;

	public warehouseMarker: any;

	@Input()
	order: Order;

	public isLoaded: boolean;

	ngAfterViewInit(): void {
		this.loadMap();
	}

	ngOnChanges(): void {
		this.loadMarkers();
	}

	loadMap() {
		const mapProp = {
			center: new google.maps.LatLng(
				environment.DEFAULT_LATITUDE,
				environment.DEFAULT_LONGITUDE
			),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			streetViewControl: false,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
		this.loadMarkers();
	}

	loadMarkers() {
		if (this.order && !this.isLoaded && this.map) {
			this.isLoaded = true;
			const user = this.order.user;
			const warehouse = this.order.warehouse;

			this.userMarker = this.addMarker(
				user['geoLocation'],
				this.map,
				userIcon
			);

			this.warehouseMarker = this.addMarker(
				warehouse['geoLocation'],
				this.map,
				warehouseIcon
			);

			const bounds = new google.maps.LatLngBounds();
			bounds.extend(this.warehouseMarker.getPosition());
			bounds.extend(this.userMarker.getPosition());

			this.map.fitBounds(bounds);
		}
	}

	addMarker(geoLocation: IGeoLocation, map, icon) {
		const [lng, lat] = geoLocation.loc.coordinates;
		const position = new google.maps.LatLng(lat, lng);
		return new google.maps.Marker({
			position,
			map,
			icon,
		});
	}

	removeMarkers() {
		if (this.userMarker) {
			this.userMarker.setMap(null);
		}
		if (this.warehouseMarker) {
			this.warehouseMarker.setMap(null);
		}
	}

	ngOnDestroy(): void {
		this.removeMarkers();
	}
}
