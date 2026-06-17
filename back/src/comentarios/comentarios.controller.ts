import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post()
  async crear(@Body() body: { publicacionId: string; usuarioId: string; texto: string }) {
    try {
      return await this.comentariosService.crear(body);
    } catch (error) {
      throw new BadRequestException('Error al crear el comentario. Verificá los datos.');
    }
  }

  @Put(':id')
  async editar(
    @Param('id') id: string,
    @Body('texto') texto: string,
    @Body('usuarioId') usuarioId: string
  ) {
    return await this.comentariosService.editar(id, texto, usuarioId);
  }

  @Delete(':id')
  async eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
    @Query('rol') rol: string
  ) {
    return await this.comentariosService.eliminar(id, usuarioId, rol);
  }

  @Get('publicacion/:publicacionId')
  async traer(
    @Param('publicacionId') publicacionId: string,
    @Query('pagina') pagina: string,
    @Query('limite') limite: string
  ) {
    return await this.comentariosService.traerPorPublicacion(
      publicacionId,
      Number(pagina) || 1,
      Number(limite) || 5
    );
  }
}