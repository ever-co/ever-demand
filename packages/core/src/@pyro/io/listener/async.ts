import { ListenerType } from './types';
import { listenerOf } from './listener';

export type AsyncListener<T> = (...args: any[]) => Promise<T>;

export const asyncListener = listenerOf(ListenerType.Async);
