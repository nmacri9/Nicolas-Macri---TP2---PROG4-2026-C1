import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'TrabarTexto',
  standalone: true
})
export class TrabarTextoPipe implements PipeTransform {
  transform(texto: string | null | undefined, limite: number = 20): string {
    if (!texto) return '';

    if (texto.length <= limite) {
      return texto;
    }

    return texto.substring(0, limite).trim() + '...';
  }
}