import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { StatusComponent } from './status/status.component';
import { InvitedDateComponent } from './invited-date.component';

const COMPONENTS = [StatusComponent, InvitedDateComponent];

@NgModule({
	imports: [CommonModule, ThemeModule],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class InvitesRequestsTableModule {}
