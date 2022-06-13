import { MaybeType } from '../../../types';

export interface OrderStateInterface {
	preSelectedProduct?: MaybeType<string>;
	selectedProduct?: MaybeType<string>;
}
