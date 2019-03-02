import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Import this directive to trim spaces at the begining and ending of
 * the string value of an input control
 * @author Raschid J.F. Rafaelly <lachach&commat;gmail.com>
 */
@Directive({
  selector: `input[type="text"][formControlName], 
            input[type="email"][formControlName],
            input[type="text"][formControl], 
            input[type="email"][formControl],` 
})
export class InputTrimDirective {
  @Input('value') value: any;

  @HostListener('blur', ['$event']) onClick(event: Event) {

    // Get <input> element's value
    const inputElement = this.headerRef.nativeElement as HTMLInputElement;

    let parsedVal = inputElement.value && (inputElement.value as string).trim();

    // Get form control   
    if (this.ngControl)
      this.ngControl.control.setValue(parsedVal);
    else
      inputElement.value = parsedVal;

  }

  constructor(public headerRef: ElementRef, public ngControl: NgControl) {}

}
