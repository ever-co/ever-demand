export default interface IPagingOptions {
	sort?: { field: string; sortBy: string };
	limit?: number;
	skip?: number;
}
