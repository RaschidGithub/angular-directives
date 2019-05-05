import { Directive, HostListener, Input, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormControlName, NgControl } from '@angular/forms';

/**
 * Import this directive to parse number-type input fields automatically
 * from string to number.
 * 
 * ### Usage
 * Any element's value for <input>, <ion-input> and <select> with the attribute `type="number"` will be
 * parsed as number instead of string. An overlay will be created to display formatted numbers.
 * 
 * ### Attributes
 * `backgroundColor: string`: to change the overlay's bg color (defualt: `'white'`).
 * `currency: string`: If defined, the value will be formated to the selected currency. Eg.: `'MXN'`, `'GBP'`, `'USD'`
 * 
 * ### Global Config
 * You can configure global properties to apply through all the app:
 * 
 * * `FormatInputNumberDirective.backgroundColor = '#ABCDEF'`
 * * `FormatInputNumberDirective.currency = 'GBP'`
 * 
 * @author Raschid J.F. Rafaelly <lachach&commat;gmail.com>
 */
@Directive({
	selector: 'input[type="number"], input[asNumber], ion-input[type="number"], select[type="number"]',
})
export class InputNumberDirective implements AfterViewInit {
	/**
	 * Input field's value
	 */
	@Input() value: any;
	/**
	 * The background color for the input. Default: `'white'`
	 */
	@Input() backgroundColor = 'white';
	/**
	 * If provided, the number will be added currency's symbol. This overrides
	 * global config.
	 */
	@Input() currency: string | null;
	static currency: string;
	static backgroundColor: string;
	inputElement: HTMLInputElement;
	overlay: HTMLDivElement;
	textSpan: HTMLSpanElement;
	defaultLocale: string = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language || 'en';
	private inited = false;

	@HostListener('blur', ['$event']) onBlur(_event) { this.parseValue() }
	@HostListener('change', ['$event']) onChange(_event) {
		if (this.inputElement && this.inputElement.tagName.toLowerCase() == 'select')
			this.parseValue();
	}

	parseValue() {

		let parsedVal = parseFloat(this.inputElement.value);

		// Get form control   
		if (this.ngControl)
			this.ngControl.control.setValue(isNaN(parsedVal) ? null : parsedVal);
		else
			this.inputElement.value = (isNaN(parsedVal) ? null : parsedVal) as any;


		if (this.textSpan) {
			const curr = (this.currency !== null && this.currency !== 'null') && (this.currency || InputNumberDirective.currency);
			const options = curr && { style: 'currency', currency: curr };
			this.textSpan.innerText = isNaN(parsedVal) ? null : parsedVal.toLocaleString(this.defaultLocale, options);

			setTimeout(() => {
				this.showOverlay(!!this.textSpan.innerText);
			});
		}
	}

	constructor(private elementRef: ElementRef, private ngControl: NgControl) {

	}

	ngAfterViewInit() {
		// console.debug('FormatInputNumber directive inited for ', this.elementRef.nativeElement)

		let hostElement = this.elementRef.nativeElement as HTMLElement;
		const tag = hostElement.tagName && hostElement.tagName.toLowerCase();

		if (tag == 'input' || tag == 'select')
			this.inputElement = hostElement as HTMLInputElement;
		else
			this.inputElement = hostElement.getElementsByTagName('input')[0];

		this.createOverlay();
	}

	get isInputField(): boolean {
		let hostElement = this.elementRef.nativeElement as HTMLElement;
		const tag = hostElement.tagName && hostElement.tagName.toLowerCase();
		return tag == 'input';
	}

	private createOverlay() {
		if (!this.isInputField) return;

		// Wrap in div
		const wrapper = document.createElement('label');
		this.inputElement.parentElement.appendChild(wrapper);
		wrapper.appendChild(this.inputElement);
		wrapper.classList.add('input-wrapper');
		wrapper.style.position = 'relative';

		// Add overlay
		this.overlay = document.createElement('div');
		wrapper.appendChild(this.overlay);

		const bgColor = this.backgroundColor || InputNumberDirective.backgroundColor || this.inputElement.style.backgroundColor;
		this.overlay.classList.add('input-overlay');
		this.overlay.style.position = 'absolute';
		this.overlay.style.top = '0';
		this.overlay.style.bottom = '0';
		this.overlay.style.left = '0';
		this.overlay.style.right = '0';
		this.overlay.style.backgroundColor = bgColor;
		this.overlay.style.padding = this.inputElement.style.padding;
		this.overlay.style.margin = this.inputElement.style.margin || '5px';
		this.overlay.style.display = 'flex';
		this.overlay.style.cursor = 'text';

		const ngcontentAttr = this.inputElement.getAttributeNames().find(a => a.includes('ngcontent'));
		if (ngcontentAttr) this.overlay.setAttribute(ngcontentAttr, '');

		this.overlay.onclick = () => {
			this.inputElement.focus();
			this.overlay.style.display = 'none';
		};

		this.inputElement.onblur = () => {
			this.overlay.style.display = 'block';
		};

		this.textSpan = document.createElement('span');
		this.overlay.appendChild(this.textSpan);
		this.textSpan.style.marginTop = 'auto';
		this.textSpan.style.marginBottom = 'auto';

		setTimeout(() => this.parseValue());
	}

	showOverlay(show: boolean) {
		this.overlay.style.display = show ? 'block' : 'none';
	}

}