import { DBObject } from '@pyro/db/index';

// TODO maybe use here the new type mapping feature.
export type FindObject<T extends DBObject<any, any>> = any;
