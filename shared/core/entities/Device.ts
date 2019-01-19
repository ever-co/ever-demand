import { ModelName, DBObject, Schema, Types } from '../@pyro/db';
import { IDeviceRawObject, IDeviceCreateObject } from '../interfaces/IDevice';
import IPlatform from '../interfaces/IPlatform';
import ILanguage from '../interfaces/ILanguage';
import { Entity, Column } from 'typeorm';

/**
 * Represent Device (e.g. Table or Browser, used by someone to access one of our apps)
 *
 * @class Device
 * @extends {DBObject<IDeviceRawObject, IDeviceCreateObject>}
 * @implements {IDeviceRawObject}
 */
@ModelName('Device')
@Entity({ name: 'devices' })
class Device extends DBObject<IDeviceRawObject, IDeviceCreateObject>
	implements IDeviceRawObject {
	/**
	 * ChannelID used for push notifications
	 *
	 * @type {(string | null)}
	 * @memberof Device
	 */
	@Schema({ type: String, required: false })
	@Column()
	channelId: string | null;

	/**
	 * Platform of the device (broser, ios, android, etc)
	 *
	 * @type {IPlatform}
	 * @memberof Device
	 */
	@Types.String()
	@Column()
	type: IPlatform;

	/**
	 * Language setting on the device
	 *
	 * @type {ILanguage}
	 * @memberof Device
	 */
	@Types.String('en-US')
	@Column()
	language: ILanguage;

	/**
	 * Unique device Id
	 *
	 * @type {string}
	 * @memberof Device
	 */
	@Types.String()
	@Column()
	uuid: string;

	@Types.Boolean(false)
	@Column()
	isDeleted: boolean;
}

export default Device;
