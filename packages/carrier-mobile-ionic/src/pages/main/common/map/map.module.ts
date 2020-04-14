import { NgModule } from '@angular/core';
import { MapComponent } from './map.component';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [MapComponent],
	exports: [MapComponent],
	imports: [CommonModule],
})
export class MapModule {}
