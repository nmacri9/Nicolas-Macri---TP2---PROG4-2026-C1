import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true }) 
export class Comentario {
  @Prop({ required: true })
  texto!: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion!: Types.ObjectId;

  @Prop({ default: false })
  modificado!: boolean; // Arranca en falso, cuando lo editan pasa a true
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);