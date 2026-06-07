import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException, 
  Query 
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacione.dto';
import { UpdatePublicacioneDto } from './dto/update-publicacione.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', {
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'publicaciones', 
        format: async (req, file) => 'jpg',
        public_id: (req, file) => `post_${Date.now()}`,
      } as any,
    }),
  }))
  async create(
    @Body() createPublicacionDto: CreatePublicacionDto, 
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // 1. Si el usuario subió una foto, Cloudinary  devuelve la URL en file.path
      if (file) {
        createPublicacionDto.imagenUrl = file.path;
      }

      // 2. Le paso los datos limpios al servicio
      return await this.publicacionesService.create(createPublicacionDto);
      
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Error en el controlador: ' + error.message);
      }
      throw new BadRequestException('Error desconocido al crear la publicación');
    }
  }

  // --- MÉTODOS POR DEFECTO ---

  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('orden') orden?: 'fecha' | 'likes',
    @Query('autor') autor?: string,
  ) {
    const opciones = {
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
      orden: orden || 'fecha',
      autor: autor || undefined,
    };

    return this.publicacionesService.findAll(opciones);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublicacioneDto: UpdatePublicacioneDto) {
    return this.publicacionesService.update(+id, updatePublicacioneDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string, 
    
    
    @Query('usuarioId') usuarioId: string, 
    @Query('rol') rol: string 
  ) {
    
    // Validamos que por Postman no nos hayamos olvidado de mandar estos datos
    if (!usuarioId || !rol) {
      throw new BadRequestException('Falta enviar el usuarioId o el rol por la URL para validar permisos.');
    }

    return await this.publicacionesService.remove(id, usuarioId, rol);
  }
  // --- RUTAS PARA LIKES ---

  // Uso para agregar el me gusta
  @Post(':id/like')
  async darLike(
    @Param('id') idPublicacion: string,
    @Query('usuarioId') usuarioId: string 
  ) {
    if (!usuarioId) {
      throw new BadRequestException('Falta enviar el usuarioId por la URL.');
    }
    return await this.publicacionesService.darLike(idPublicacion, usuarioId);
  }

  @Delete(':id/like')
  async quitarLike(
    @Param('id') idPublicacion: string,
    @Query('usuarioId') usuarioId: string
  ) {
    if (!usuarioId) {
      throw new BadRequestException('Falta enviar el usuarioId por la URL.');
    }
    return await this.publicacionesService.quitarLike(idPublicacion, usuarioId);
  }
}