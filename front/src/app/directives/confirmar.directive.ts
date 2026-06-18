import { Directive, ElementRef, HostListener, inject, output, input } from '@angular/core';

@Directive({
  selector: '[appBotonConfirmar]',
  standalone: true
})
export class ConfirmarDirective {
  mensaje = input<string>('¿Estás seguro?'); 
  confirmado = output<void>();
  
  private elemento = inject(ElementRef);
  private esperando = false;
  private textoOriginal = '';

  @HostListener('click', ['$event'])
  onClick(evento: Event) {
    evento.stopImmediatePropagation();

    if (!this.esperando) {
      this.esperando = true;
      this.textoOriginal = this.elemento.nativeElement.innerText;
      
      this.elemento.nativeElement.innerText = '¿Seguro? Clic para borrar';
      this.elemento.nativeElement.style.backgroundColor = '#dc3545';
      this.elemento.nativeElement.style.color = 'white';
    } else {
      this.confirmado.emit();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.esperando) {
      this.esperando = false;
      this.elemento.nativeElement.innerText = this.textoOriginal;
      this.elemento.nativeElement.style.backgroundColor = '';
      this.elemento.nativeElement.style.color = '';
    }
  }
}