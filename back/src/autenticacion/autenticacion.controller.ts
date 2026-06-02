import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AutenticacionService } from './autenticacion.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto'; 

@Controller('auth') 
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
  async registro(@Body() body: CreateUsuarioDto) {
   
    return this.autenticacionService.registrarUsuario(body);
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