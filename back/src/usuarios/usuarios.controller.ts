import * as dotenv from 'dotenv';
dotenv.config();
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { TokenGuard } from '../autenticacion/token/token.guard';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Controller('usuarios')
export class UsuariosController { 
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(TokenGuard)
  @Post()
  @UseInterceptors(FileInterceptor('imagenPerfil', {
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'perfiles',
        format: async (req, file) => 'jpg',
        public_id: (req, file) => `user_${Date.now()}`,
      } as any,
    }),
  }))
  create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.usuariosService.create(createUsuarioDto, file);
  }

  @UseGuards(TokenGuard) 
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id); 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @UseGuards(TokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  @UseGuards(TokenGuard)
  @Post(':id/activar')
  activar(@Param('id') id: string) {
    return this.usuariosService.activar(id); 
  }
}