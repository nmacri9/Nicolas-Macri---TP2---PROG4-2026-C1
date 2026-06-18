import { Directive, ElementRef, HostListener, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appBotonConfirmar]',
  standalone: true
})
export class ConfirmarDirective {
  mensaje = input<string>('¿Estás seguro?');

  // Evento que se dispara SOLO si el usuario acepta el confirm
  confirmado = output<void>();

  @HostListener('click', ['$event'])
  onClick(evento: MouseEvent) {
    // Frena el click original para que no ejecute nada todavía
    evento.stopImmediatePropagation();

    const acepto = confirm(this.mensaje());

    if (acepto) {
      // Solo si acepta, emitimos el evento para que el componente haga su lógica
      this.confirmado.emit();
    }
  }
}