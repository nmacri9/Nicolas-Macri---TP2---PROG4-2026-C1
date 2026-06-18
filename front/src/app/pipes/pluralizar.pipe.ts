import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluralizar',
  standalone: true
})
export class PluralizarPipe implements PipeTransform {
  transform(cantidad: number | null | undefined, singular: string, plural?: string): string {
    const cant = cantidad ?? 0;

    // Si no le paso la palabra en plural, le agrego una s
    const palabraPlural = plural ?? `${singular}s`;

    const palabra = cant === 1 ? singular : palabraPlural;

    return `${cant} ${palabra}`;
  }
}