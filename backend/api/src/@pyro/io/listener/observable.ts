import { Observable } from 'rxjs';
import { ListenerType } from './types';
import { listenerOf } from './listener';

export type ObservableListener<T> = (...args: any[]) => Observable<T>;

export const observableListener = listenerOf(ListenerType.Observable);
