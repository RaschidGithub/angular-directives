import { Directive, HostListener, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

/**
 * Import this directive to parse number-type input fields automatically
 * from string to number.
 * 
 * ### Usage
 * Any element's value for <input>, <ion-input> and <select> with the attribute `type="number"` 
 * or `asNumber` will be parsed as number instead of the default string type. 
 * An overlay on top of it will be created to display formatted numbers.
 * 
 * ### Attributes
 * * `backgroundColor: string`. The background color for the input. Default: `'white'`.
 * * `currency: string`. If defined, the value will be formated to the selected currency. Eg.: `'MXN'`, `'GBP'`, `'USD'`
 * * `ignoreFormat`. if set, text in input does not get formatted (but its value still get's parsed as `number`).
 * 
 * ### Global Config
 * You can configure global properties to apply through all the app:
 * 
 * * `InputNumberDirective.backgroundColor = '#ABCDEF'`
 * * `InputNumberDirective.currency = 'GBP'`
 * *  `InputNumberDirective.decimalPlaces = 0`
 * 
 * @author Raschid J.F. Rafaelly <lachach&commat;gmail.com>
 */
@Directive({
	selector: 'input[type="number"], input[asNumber], ion-input[type="number"], select[type="number"]',
})
export class InputNumberDirective implements AfterViewInit, OnDestroy {
	/**
	 * The background color for the input. Default: `'white'`
	 */
	@Input() backgroundColor = 'white';
	/**
	 * If provided, the number will be added currency's symbol. This overrides
	 * global config.
	 */
	@Input() set currency(val: string | null) {
		this._currency = val;
		this.parseValue();
	};
	/**
	 * if set, text in input does not get formatted (but its value still get's parsed as `number`)
	 */
	@Input() ignoreFormat: string | boolean | null;
	@Input() decimalPlaces: string | number = 0;

	static currency: string;
	static backgroundColor: string;
	static decimalPlaces: number;
	_currency: string;
	inputElement: HTMLInputElement;
	overlay: HTMLDivElement;
	textSpan: HTMLSpanElement;
	defaultLocale: string = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language || 'en';
	prevVal: string | number;
	subscription: Subscription = new Subscription();
	isSelect = false;

	@HostListener('blur', ['$event'])
	onBlur(_event) {
		this.parseValue();
	}

	@HostListener('change', ['$event'])
	onChange(_event) {
		if (this.isSelect) this.parseValue();
	}

	@HostListener('keyup', ['$event'])
	keyUp(event: KeyboardEvent) {

		// Prevent entering invalid data (Iionic v3)
		if (this.isIonInput) {
			const pattern = /[0-9\.\-]/;

			if (!pattern.test(event.key)
				&& event.key != "ArrowRight"
				&& event.key != "ArrowLeft"
				&& event.key != "Backspace") {
				// event.stopPropagation();  //not working
				// event.preventDefault();   //not working
				this.setControlValue(this.prevVal);
			}
		}
	}

	constructor(private elementRef: ElementRef, private ngControl: NgControl) { }

	ngAfterViewInit() {
		// console.debug('InputNumberDirective directive inited for ', this.elementRef.nativeElement)

		let hostElement = this.elementRef.nativeElement as HTMLElement;
		const tag = hostElement.tagName && hostElement.tagName.toLowerCase();

		if (tag == 'input' || tag == 'select')
			this.inputElement = hostElement as HTMLInputElement;
		else
			this.inputElement = hostElement.getElementsByTagName('input')[0];

		this.isSelect = this.inputElement && this.inputElement.tagName.toLowerCase() == 'select';
		this.decimalPlaces = Number(this.decimalPlaces);
		this.decimalPlaces = isNaN(this.decimalPlaces) ? Number(InputNumberDirective.decimalPlaces) : this.decimalPlaces;

		this.createOverlay();

		// Update the first time if control value is loaded programatically
		this.subscription = this.ngControl.valueChanges.subscribe(() => {
			this.subscription.unsubscribe();
			setTimeout(() => this.parseValue());
		});

	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	get hasFocus(): boolean {
		return document.activeElement === this.inputElement;
	}

	get isIonInput(): boolean {
		let hostElement = this.elementRef.nativeElement as HTMLElement;
		const tag = hostElement.tagName && hostElement.tagName.toLowerCase();
		const isInput = tag == 'input';
		return !isInput;
	}

	parseValue() {
		const rawValue: string | number = this.getControlValue();
		const parsedVal = parseFloat(rawValue as string);
		const isblank = rawValue == '' || rawValue == null;
		const isInvalid = isNaN(parsedVal);

		if (this.textSpan) {
			const ignore = this.ignoreFormat != undefined && this.ignoreFormat !== false && this.ignoreFormat != 'false';
			if (!ignore) {

				// Get curerency
				const curr = (this._currency !== null && this._currency !== 'null') && (this._currency || InputNumberDirective.currency);
				const currencyOptions = curr && { style: 'currency', currency: curr } || {};

				// Get decimal places
				const fix = Number(this.decimalPlaces);
				const decimalOptions = !isNaN(fix) && {
					minimumFractionDigits: fix,
					maximumFractionDigits: fix
				} || {};

				// Apply format to overlay text
				this.textSpan.innerText = isInvalid ? 'Invalid value!' :
					parsedVal.toLocaleString(this.defaultLocale, {
						...currencyOptions,
						...decimalOptions
					});

			} else {
				// Just copy the value to the overlay text
				this.textSpan.innerText = parsedVal.toString();
			}

			this.setControlValue(isInvalid ? null : parsedVal);
			this.showOverlay(!isblank && !this.isSelect);
		}
	}

	setControlValue(value: any) {
		if (this.ngControl) {
			this.prevVal = this.ngControl.control.value;
			this.ngControl.control.setValue(value);
		} else {
			this.prevVal = this.inputElement.value;
			this.inputElement.value = value;
		}
	}

	getControlValue(): string | number {
		if (this.ngControl) {
			return this.ngControl.control.value;
		} else {
			return this.inputElement.value;
		}
	}

	private createOverlay() {

		// Wrap in div
		const wrapper = document.createElement('label');
		wrapper.classList.add('input-wrapper');
		wrapper.style.position = 'relative';

		this.inputElement.parentElement.appendChild(wrapper);
		wrapper.appendChild(this.inputElement);

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

		const ngcontentAttr = (this.inputElement as any).getAttributeNames().find((a: string) => a.includes('ngcontent'));
		if (ngcontentAttr) this.overlay.setAttribute(ngcontentAttr, '');

		this.textSpan = document.createElement('span');
		this.textSpan.style.marginTop = 'auto';
		this.textSpan.style.marginBottom = 'auto';
		this.overlay.appendChild(this.textSpan);

		this.overlay.onclick = () => {
			this.inputElement.focus();
		};

		this.inputElement.onfocus = () => {
			this.showOverlay(false);
		};
	}

	showOverlay(show: boolean) {
		this.overlay.style.display = show ? 'block' : 'none';
	}

}