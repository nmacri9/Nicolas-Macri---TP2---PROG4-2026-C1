import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post()
  crear(@Body() body: { publicacionId: string; usuarioId: string; texto: string }) {
    return this.comentariosService.crear(body);
  }

  @Put(':id')
  editar(@Param('id') id: string, @Body('texto') texto: string) {
    return this.comentariosService.editar(id, texto);
  }

  @Get('publicacion/:publicacionId')
  traer(
    @Param('publicacionId') publicacionId: string,
    @Query('pagina') pagina: string, // Viene de la URL ej: ?pagina=1
    @Query('limite') limite: string  // Viene de la URL ej: &limite=5
  ) {
    return this.comentariosService.traerPorPublicacion(
      publicacionId, 
      Number(pagina) || 1, 
      Number(limite) || 5
    );
  }
}