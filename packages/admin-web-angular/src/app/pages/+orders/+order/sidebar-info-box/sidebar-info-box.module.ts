import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from '@app/@core/toaster';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
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
