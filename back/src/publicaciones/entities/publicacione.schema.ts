import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity'; 

export type PublicacionDocument = Publicacion & Document;

@Schema({ timestamps: true }) 
export class Publicacion {
  @Prop({ required: true })
  titulo!: string;

  @Prop({ required: true })
  descripcion!: string;

  @Prop()
  imagenUrl?: string;

  // Relación del usuario creador
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor!: Types.ObjectId;

  //  IDs para saber  qué usuarios dieron mg
  @Prop({ type: [{ type: Types.ObjectId, ref: Usuario.name }], default: [] })
  likes!: Types.ObjectId[];

  // Contador para poner (mas likes arriba)
  @Prop({ default: 0 })
  cantidadLikes!: number;

  @Prop({ default: true })
  activo!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);