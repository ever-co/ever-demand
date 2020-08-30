import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';
import { map, share, first } from 'rxjs/operators';
import Device from '@modules/server.common/entities/Device';
import { IDeviceRawObject } from '@modules/server.common/interfaces/IDevice';

export interface DeviceInfo {
	language: string;
	type: string;
	uuid: string;
}

export interface DeviceFindInput {
	channelId?: string;
	language?: string;
	type?: string;
	uuid?: string;
}

interface RemovedObject {
	n: number;
	ok: number;
}

@Injectable()
export class DeviceService {
	constructor(private readonly apollo: Apollo) {}

	private devices$: Observable<Device[]> = this.apollo
		.watchQuery<{ devices: IDeviceRawObject[] }>({
			query: gql`
				query allDevices {
					devices {
						_id
						language
						type
						uuid
					}
				}
			`,
			pollInterval: 2000,
		})
		.valueChanges.pipe(
			map((result) => result.data.devices),
			map((devices) => devices.map((d) => this._deviceFactory(d))),
			share()
		);

	getByFindInput(findInput: DeviceFindInput): Observable<Device[]> {
		return this.apollo
			.query({
				query: gql`
					query GetByUuid($findInput: DeviceFindInput) {
						devices(findInput: $findInput) {
							id
						}
					}
				`,
				variables: { findInput },
			})
			.pipe(
				map((res) => res.data['devices']),
				share()
			);
	}

	async getDeviceByUuid(uuid: string) {
		return this.getByFindInput({ uuid }).pipe(first()).toPromise();
	}

	getWithWebsocket() {
		const COMMENT_QUERY = gql`
			query _allDevices {
				devices {
					_id
					language
					type
					uuid
				}
			}
		`;

		return this.apollo.watchQuery({
			query: COMMENT_QUERY,
		});
	}

	getDevices(): Observable<Device[]> {
		return this.devices$;
	}

	update(deviceId: string, updateInput: DeviceInfo): Observable<Device> {
		return this.apollo
			.mutate<{ updateDevice: IDeviceRawObject }>({
				mutation: gql`
					mutation UpdateDevice(
						$deviceId: String!
						$updateInput: DeviceUpdateInput!
					) {
						updateDevice(id: $deviceId, updateInput: $updateInput) {
							id
						}
					}
				`,
				variables: {
					deviceId,
					updateInput,
				},
			})
			.pipe(
				map((result: any) => result.data.updateDevice.update),
				map((d) => this._deviceFactory(d)),
				share()
			);
	}

	removeByIds(ids: string[]): Observable<RemovedObject> {
		return this.apollo
			.mutate({
				mutation: gql`
					mutation RemoveDeviceByIds($ids: [String!]!) {
						removeDeviceByIds(ids: $ids) {
							n
						}
					}
				`,
				variables: { ids },
			})
			.pipe(
				map((result: any) => result.data.removeDeviceByIds),
				share()
			);
	}

	create(createInput: DeviceInfo): Observable<Device> {
		return this.apollo
			.mutate<{ createDevice: IDeviceRawObject }>({
				mutation: gql`
					mutation CreateDevice($createInput: DeviceCreateInput!) {
						createDevice(createInput: $createInput) {
							id
						}
					}
				`,
				variables: {
					createInput,
				},
			})
			.pipe(
				map((result: any) => result.data.createDevice),
				share()
			);
	}

	protected _deviceFactory(device: IDeviceRawObject) {
		return device == null ? null : new Device(device);
	}
}
