import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { TokenGuard } from '../autenticacion/token/token.guard';

@Controller('estadisticas')
@UseGuards(TokenGuard) 
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // grafico de torta (Activas e Inactivas)
  @Get('publicaciones-estado')
  async getEstado() {
    return this.estadisticasService.getEstadoPublicaciones();
  }

  // grafico de barras (Top 5 populares)
  @Get('publicaciones-top')
  async getTop() {
    return this.estadisticasService.getTopPublicaciones();
  }

  // Grafico torta: publicaciones por usuario en un lapso
  @Get('publicaciones-por-usuario')
  async getPublicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string
  ) {
    return this.estadisticasService.getPublicacionesPorUsuario(desde, hasta);
  }

  // Grafico líneas: comentarios totales en un lapso
  @Get('comentarios-totales')
  async getComentariosTotales(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string
  ) {
    return this.estadisticasService.getComentariosTotales(desde, hasta);
  }

  // Grafico barras: comentarios por publicacion en un lapso
  @Get('comentarios-por-publicacion')
  async getComentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string
  ) {
    return this.estadisticasService.getComentariosPorPublicacion(desde, hasta);
  }
}