import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { hostElement } from '@angular/core/src/render3/instructions';
import { FormControl, FormControlName, NgControl } from '@angular/forms';

/**
 * Generated class for the FormatInputNumberDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: 'ion-input[type="number"]' // Attribute selector
})
export class FormatInputNumberDirective {
  @Input('value') value: any;

  @HostListener('ionBlur', ['$event']) onClick(event: Event) {

    // Get <input> element's value
    let hostElement = this.headerRef.nativeElement as HTMLElement;
    let inputElement = hostElement.getElementsByTagName('input')[0];
    let parsedVal = parseFloat(inputElement.value);

    // Get form control   
    if (this.ngControl)
      this.ngControl.control.setValue(isNaN(parsedVal) ? null : parsedVal);
    else
      inputElement.value = (isNaN(parsedVal) ? null : parsedVal) as any;

  }

  constructor(private headerRef: ElementRef, private ngControl: NgControl) { }

}
