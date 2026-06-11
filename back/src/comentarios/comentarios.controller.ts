import { Controller, Get, Post, Put, Body, Param, Query, BadRequestException } from '@nestjs/common';
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
  async editar(@Param('id') id: string, @Body('texto') texto: string) {
    return await this.comentariosService.editar(id, texto);
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