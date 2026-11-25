import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectionLostPageModule } from './+connection-lost/connection-lost.module';

const routes: Routes = [
	{
		path: 'connection-lost',
		// Not lazy, see the errors route in pages.module.ts.
		loadChildren: () => ConnectionLostPageModule,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ErrorsModule {}
