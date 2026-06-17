import { Controller, Get, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { TokenGuard } from '../autenticacion/token/token.guard';

@Controller('estadisticas')
@UseGuards(TokenGuard) 
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  //  grafico de torta (Activas e Inactivas)
 // GET http://localhost:3000/estadisticas/publicaciones-estado
  @Get('publicaciones-estado')
  async getEstado() {
    return this.estadisticasService.getEstadoPublicaciones();
  }

  // grafico de barras (Top 5 populares)
    // GET http://localhost:3000/estadisticas/publicaciones-top
  @Get('publicaciones-top')
  async getTop() {
    return this.estadisticasService.getTopPublicaciones();
  }
}