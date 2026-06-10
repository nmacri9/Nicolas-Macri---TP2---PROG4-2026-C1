import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) 
export class Comentario extends Document {
  @Prop({ required: true })
  publicacionId!: string; // id de la publi

  @Prop({ required: true })
  usuarioId!: string; // id usuario q escribio

  @Prop({ required: true })
  texto!: string; //guarda el coment

  @Prop({ default: false })
  modificado!: boolean; // para modificar
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);