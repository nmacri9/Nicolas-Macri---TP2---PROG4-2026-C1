import { Module } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './entities/publicaciones.schema'; 
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { Comentario, ComentarioSchema } from '../comentarios/entities/comentario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema } 
    ]),
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService],
})
export class PublicacionesModule {}