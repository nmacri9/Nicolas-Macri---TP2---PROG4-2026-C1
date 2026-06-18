import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempo',
  standalone: true
})
export class TiempoPipe implements PipeTransform {
  transform(fecha: string | Date | null | undefined): string {
    if (!fecha) return '';

    const fechaPublicacion = new Date(fecha);
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - fechaPublicacion.getTime();

    const segundos = Math.floor(diferenciaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    if (dias < 7) return `Hace ${dias} día${dias === 1 ? '' : 's'}`;

    // Si pasó más de una semana, muestra la fecha normal
    return fechaPublicacion.toLocaleDateString('es-AR');
  }
}