type ExistenceEventTypeCreated = 'created';
const ExistenceEventTypeCreated: ExistenceEventTypeCreated = 'created';

type ExistenceEventTypeUpdated = 'updated';
const ExistenceEventTypeUpdated: ExistenceEventTypeUpdated = 'updated';

type ExistenceEventTypeRemoved = 'removed';
const ExistenceEventTypeRemoved: ExistenceEventTypeRemoved = 'removed';

export type ExistenceEventType =
	| ExistenceEventTypeCreated
	| ExistenceEventTypeUpdated
	| ExistenceEventTypeRemoved;

// tslint:disable-next-line:no-namespace
export namespace ExistenceEventType {
	export const Created = ExistenceEventTypeCreated;
	export const Updated = ExistenceEventTypeUpdated;
	export const Removed = ExistenceEventTypeRemoved;
}

export type ExistenceEvent<T> =
	| {
			id: string;
			value: T;
			lastValue: null;
			type: ExistenceEventTypeCreated;
	  }
	| {
			id: string;
			value: T;
			lastValue: T;
			type: ExistenceEventTypeUpdated;
	  }
	| {
			id: string;
			value: null;
			lastValue: T;
			type: ExistenceEventTypeRemoved;
	  };
