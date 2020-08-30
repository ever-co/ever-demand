export class DashboardLoadingIndicatorState {
	constructor(
		public totalInfo: IStoreInfoState = {
			customers: true,
			orders: true,
			revenue: true,
		},
		public todayInfo: IStoreInfoState = {
			customers: true,
			orders: true,
			revenue: true,
		},
		public chartPanelSummary: boolean = true,
		public chart: boolean = true
	) {}
}

interface IStoreInfoState {
	customers: boolean;
	orders: boolean;
	revenue: boolean;
}
