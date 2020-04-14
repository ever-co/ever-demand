import { Component, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../../@core/data/users.service';
import { first } from 'rxjs/operators';

declare var google: any;
@Component({
	selector: 'ea-customer-location',
	styleUrls: ['./ea-customer-location.component.scss'],
	templateUrl: './ea-customer-location.component.html',
})
export class CustomerLocationComponent implements OnDestroy, OnInit {
	@ViewChild('gmap', { static: true })
	gmapElement: any;
	map: google.maps.Map;
	marker: any;
	params$: any;

	constructor(
		private readonly _userService: UsersService,
		private readonly _router: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.params$ = this._router.params.subscribe(async (r) => {
			const user = await this._userService
				.getUserById(r.id)
				.pipe(first())
				.toPromise();
			const coordinates = new google.maps.LatLng(
				user['geoLocation'].coordinates.lat,
				user['geoLocation'].coordinates.lng
			);
			this.showMap(coordinates);
			this.marker = this.addMarker(coordinates, this.map);
		});
	}

	showMap(coordinates) {
		const mapProp = {
			center: coordinates,
			zoom: 17,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}

	addMarker(coordinates, map) {
		return new google.maps.Marker({
			position: coordinates,
			map,
		});
	}
	ngOnDestroy(): void {
		this.marker.setMap(null);

		if (this.params$) {
			this.params$.unsubscribe();
		}
	}
}
