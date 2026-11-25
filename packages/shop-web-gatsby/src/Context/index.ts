import { useContext } from 'react';
import { AppContext, Provider, locate } from './Context';

export type { AppContextValue, Coordinates } from './Context';

export { AppContext, Provider, locate };

/** The app context; components only render inside the root Provider. */
export function useAppContext() {
	return useContext(AppContext)!;
}
