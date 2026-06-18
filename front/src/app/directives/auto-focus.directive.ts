import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {
  appAutoFocus = input<boolean>(true);

  private elemento = inject(ElementRef);

  ngAfterViewInit() {
    if (this.appAutoFocus()) {
      // timeout para que Angular termine de renderizar el elemento
      // antes de intentar darle el foco
      setTimeout(() => {
        this.elemento.nativeElement.focus();
      }, 50);
    }
  }
}