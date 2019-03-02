import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { FormControl, FormControlName, NgControl } from '@angular/forms';

/**
 * Import this directive to parse number-type input fields automatically
 * from string to number.
 * @author Raschid J.F. Rafaelly <lachach&commat;gmail.com>
 */
@Directive({
  selector: 'input[type="number"], ion-input[type="number"]' // Attribute selector
})
export class FormatInputNumberDirective {
  @Input('value') value: any;

  @HostListener('ionBlur', ['$event']) onClick(event: Event) {

    // Get <input> element's value
    let hostElement = this.headerRef.nativeElement as HTMLElement;

    let inputElement: HTMLInputElement;
    if (hostElement.tagName == 'input')
      inputElement = hostElement as HTMLInputElement;
    else
      inputElement = hostElement.getElementsByTagName('input')[0];

    let parsedVal = parseFloat(inputElement.value);

    // Get form control   
    if (this.ngControl)
      this.ngControl.control.setValue(isNaN(parsedVal) ? null : parsedVal);
    else
      inputElement.value = (isNaN(parsedVal) ? null : parsedVal) as any;

  }

  constructor(private headerRef: ElementRef, private ngControl: NgControl) { 
    
  }

}
