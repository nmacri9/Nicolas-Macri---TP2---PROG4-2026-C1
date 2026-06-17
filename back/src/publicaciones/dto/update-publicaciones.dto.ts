import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicacionDto } from './create-publicaciones.dto';

export class UpdatePublicacioneDto extends PartialType(CreatePublicacionDto) {}
