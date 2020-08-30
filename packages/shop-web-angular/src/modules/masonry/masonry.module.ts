import { NgModule } from '@angular/core';
import { MasonryComponent } from './masonry.component';
import { MasonryBrickDirective } from './masonry-brick.directive';

export const MASONRY_DIRECTIVES = [MasonryComponent, MasonryBrickDirective];

@NgModule({
	declarations: MASONRY_DIRECTIVES,
	exports: MASONRY_DIRECTIVES,
})
export class MasonryModule {}
