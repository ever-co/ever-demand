export interface IExistingCustomersViewModel {
	total: number;
	perStore: Array<{ storeId: string; customersCount: number }>;
}
