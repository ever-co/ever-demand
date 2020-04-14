import Invite from './entities/Invite';

export const launched = 'launched_notification';
export type launched = 'launched_notification';

export interface INotification {
	event: launched;

	[key: string]: string;
}

export interface ILaunchedNotification extends INotification {
	event: launched;
	invite: string;
}

export interface ILaunchedNotificationParsed {
	event: launched;
	invite: Invite;
}
