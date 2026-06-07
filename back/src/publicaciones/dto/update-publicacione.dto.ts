import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicacionDto } from './create-publicacione.dto';

export class UpdatePublicacioneDto extends PartialType(CreatePublicacionDto) {}
