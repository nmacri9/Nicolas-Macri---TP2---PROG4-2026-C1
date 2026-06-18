import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[appResaltarComentario]',
  standalone: true
})
export class ResaltarComentarioDirective {
  appResaltarComentario = input<string>('#1e2732');

  private elemento = inject(ElementRef);

  @HostListener('mouseenter')
  onMouseEnter() {
    this.elemento.nativeElement.style.backgroundColor = this.appResaltarComentario();
    this.elemento.nativeElement.style.transition = 'background-color 0.2s ease';
    this.elemento.nativeElement.style.borderRadius = '8px';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.elemento.nativeElement.style.backgroundColor = 'transparent';
  }
}