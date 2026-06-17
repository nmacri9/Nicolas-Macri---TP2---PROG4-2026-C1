import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema({ timestamps: true }) // genera automatica fecha de creacion y actualizacion
export class Usuario {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  apellido!: string;

  @Prop({ required: true, unique: true })
  correo!: string;

  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ maxlength: 150 })
  descripcion!: string;

  @Prop({ required: true, default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil!: string;
  // Controla la baja lógica: t= cuenta habilitada f= cuenta deshabilitada
  @Prop({ required: true, default: true })
  activo!: boolean;

  @Prop()
  imagenPerfilUrl?: string; 
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);