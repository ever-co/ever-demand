import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '@app/@theme';
import { SidebarInfoBoxComponent } from './sidebar-info-box.component';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
	],
	declarations: [SidebarInfoBoxComponent],
	exports: [SidebarInfoBoxComponent],
})
export class SidebarInfoBoxModule {}
