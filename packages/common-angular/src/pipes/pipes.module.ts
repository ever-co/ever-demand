import { NgModule } from '@angular/core';
import { SafePipe } from './safe.pipe';
import { ReplacePipe } from './replace.pipe';
import { CapitalizePipe } from './capitalize.pipe';
import { PluralPipe } from './plural.pipe';
import { RoundPipe } from './round.pipe';
import { TimingPipe } from './timing.pipe';
import { NumberWithCommasPipe } from './number-with-commas.pipe';

@NgModule({
	exports: [
		SafePipe,
		ReplacePipe,
		CapitalizePipe,
		PluralPipe,
		RoundPipe,
		TimingPipe,
		NumberWithCommasPipe,
	],
	imports: [],
	declarations: [
		SafePipe,
		ReplacePipe,
		CapitalizePipe,
		PluralPipe,
		RoundPipe,
		TimingPipe,
		NumberWithCommasPipe,
	],
})
export class PipesModule {}
