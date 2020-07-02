export interface IAdminAppSettings {
	// use 0 for false and 1 for true because is more easy then cast boolean string on the client
	adminPasswordReset: 0 | 1;
	fakeDataGenerator: 0 | 1;
}
