import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty()
  texto!: string;

  @IsMongoId()
  @IsNotEmpty()
  publicacion!: string; 
}
