import { NgModule } from '@angular/core';
import { InputTrimDirective } from './input-trim.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [
		InputTrimDirective
	],
	imports:[
		FormsModule,
		ReactiveFormsModule,
	],
	exports: [
		InputTrimDirective
	],
})
export class DirectivesModule { }
