import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '../../@theme';
import { ChartsPanelComponent } from './charts-panel/charts-panel.component';
import { OrdersChartComponent } from './charts-panel/charts/orders-chart/orders-chart.component';
import { ProfitChartComponent } from './charts-panel/charts/profit-chart/profit-chart.component';
import { ChartPanelHeaderComponent } from './charts-panel/chart-panel-header/chart-panel-header.component';
import { ChartPanelSummaryComponent } from './charts-panel/chart-panel-summary/chart-panel-summary.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { LegendChartComponent } from './charts-panel/legend-chart/legend-chart.component';
import { DashboardSelectStoreComponent } from './dashboard-select-store/dashboard-select-store.component';
import { LayoutService } from '@app/@core/services/dashboard/layout.service';
import { OrdersProfitChartService } from '@app/@core/services/dashboard/orders-profit-chart.service';
import { OrdersChartService } from '@app/@core/services/dashboard/orders-chart.service';
import { PeriodsService } from '@app/@core/services/dashboard/periods.service';
import { ProfitChartService } from '@app/@core/services/dashboard/profit-chart.service';
import { ToasterModule } from 'angular2-toaster';
import { NbSpinnerModule } from '@nebular/theme';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
	},
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		NgxEchartsModule,
		ToasterModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		NbSpinnerModule,
		PipesModule,
		NgSelectModule,
		FormsModule,
	],
	declarations: [
		DashboardComponent,
		ChartsPanelComponent,
		ChartPanelHeaderComponent,
		ChartPanelSummaryComponent,
		OrdersChartComponent,
		ProfitChartComponent,
		LegendChartComponent,
		DashboardSelectStoreComponent,
	],
	entryComponents: [
		ChartsPanelComponent,
		ChartPanelHeaderComponent,
		ChartPanelSummaryComponent,
		OrdersChartComponent,
		ProfitChartComponent,
		LegendChartComponent,
	],
	providers: [
		LayoutService,
		OrdersProfitChartService,
		OrdersChartService,
		ProfitChartService,
		PeriodsService,
	],
})
export class DashboardModule {}
