import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'connection-lost',
		loadChildren:
			'./+connection-lost/connection-lost.module#ConnectionLostPageModule'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ErrorsModule {}
