import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * # Autocomplete for Ionic Input #
 * ## Usage ##
 * Just add the `autoCompleteFromArray` parameter to any ion-input.
 * 
 * ```
 * <ion-input type="text" [autoCompleteFromArray]="arrayOfStrings"></ion-input>
 * ```
 * 
 * ### Attributes ###
 * 
 * `autoCompleteFromArray`: Array from which to take string values from
 * `minLength`: (optional) Minimum characters before triggering autocomplete.
 * 
 * @author Raschid J.F. Rafaelly <lachach&commat;gmail.com>
 */
@Directive({
	selector: 'ion-input[type="text"][autoCompleteFromArray]' // Attribute selector
})
export class InputAutocompleteDirective {
	/**
	 * Array from which to take string values from
	 */
	@Input('autoCompleteFromArray') sourceList: string[];
	/**
	 * Minimum characters before triggering autocomplete.
	 */
	@Input() minLength = 3;

	constructor(private headerRef: ElementRef, private ngControl: NgControl) {
		console.log('Format input autocomplete directive active');
	}

	@HostListener('keyup', ['$event'])
	keyup(event: KeyboardEvent) {

		//Return if no letter, number or space was pressed
		// iOS and browser
		if (event.key) {
			if (!event.key.match(/^[\w ]$/)) return;
		} 
		// Android
		else if (event.keyCode) {
			if ((event.keyCode < 48 || 90 < event.keyCode) && event.keyCode != 32) return;
		} else {
			console.error("Can't find key nor keycode in keyboardevent");
			return;
		}

		// Get <input> element's value
		let hostElement = this.headerRef.nativeElement as HTMLElement;
		let inputElement = hostElement.getElementsByTagName('input')[0];
		let currentVal = inputElement.value.trimLeft();

		let foundText = this.sourceList && this.sourceList.find(e => e.toLocaleLowerCase().startsWith(currentVal.toLocaleLowerCase()));

		// Get form control   
		if (this.ngControl && foundText && currentVal.length >= this.minLength) {
			let back = event.key == "Backspace";
			this.ngControl.control.setValue(foundText);
			inputElement.setSelectionRange(currentVal.length - (back ? 1 : 0), foundText.length);
		}
	}
}
