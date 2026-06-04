import * as dotenv from 'dotenv';
dotenv.config();
import { Controller, Post, Body, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import type { Response } from 'express';
import { AutenticacionService } from './autenticacion.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto'; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Controller('auth') 
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
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
  async registro(
    @Body() body: CreateUsuarioDto,
    @UploadedFile() file: Express.Multer.File 
  ) {
    return this.autenticacionService.registrarUsuario(body, file);
  }

  @Post('login')
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) response: Response 
  ) {
    const respuestaServicio = await this.autenticacionService.loginUsuario(body);

    response.cookie('Authorization', respuestaServicio.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true, 
      expires: new Date(Date.now() + 1000 * 60 * 15), 
    });

    return {
      status: respuestaServicio.status,
      mensaje: respuestaServicio.mensaje,
      usuario: respuestaServicio.usuario
    };
  }
}