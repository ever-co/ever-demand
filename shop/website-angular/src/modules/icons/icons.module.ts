import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material';

import { IconComponent } from './icon.component';
import { IconsService } from './icons.service';

@NgModule({
	imports: [CommonModule, MatIconModule],
	exports: [IconComponent],
	declarations: [IconComponent],
	providers: [IconsService]
})
export class IconsModule {}
