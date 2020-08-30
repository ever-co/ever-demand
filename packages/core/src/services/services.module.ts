import { Global, Module } from '@nestjs/common';
import { ServiceSymbol } from './IService';
import { servicesContainer } from './inversify.config';

function getServices() {
	return servicesContainer.getAll(ServiceSymbol).map((service) => {
		return {
			provide: service.constructor,
			useValue: service,
		};
	});
}

const services = getServices();

@Global()
@Module({
	providers: services,
	exports: services,
})
export class ServicesModule {
	constructor() {}
}
