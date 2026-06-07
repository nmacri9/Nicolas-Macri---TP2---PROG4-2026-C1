import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  titulo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion!: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsMongoId({ message: 'El ID del autor no es válido' })
  @IsNotEmpty()
  autor!: string; // Recibimos el ID del usuario logueado
}