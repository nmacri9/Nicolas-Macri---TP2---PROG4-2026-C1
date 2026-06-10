import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { Comentario, ComentarioSchema } from './entities/comentario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comentario.name, schema: ComentarioSchema }])
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}