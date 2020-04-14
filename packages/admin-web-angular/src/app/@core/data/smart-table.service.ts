import { Injectable } from '@angular/core';

@Injectable()
export class SmartTableService {
	data = [];

	getData() {
		return this.data;
	}
}
