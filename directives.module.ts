import { NgModule } from '@angular/core';
import { InputTrimDirective } from './input-trim.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputNumberDirective as InputNumberDirective } from './input-number.directive';
import { InputAutocompleteDirective } from './input-autocomplete';

InputNumberDirective.currency = 'GBP';

@NgModule({
	declarations: [
		InputTrimDirective,
		InputNumberDirective,
		InputAutocompleteDirective
	],
	imports:[
		FormsModule,
		ReactiveFormsModule,
	],
	exports: [
		InputTrimDirective,
		InputNumberDirective,
		InputAutocompleteDirective
	],
})
export class DirectivesModule { }
