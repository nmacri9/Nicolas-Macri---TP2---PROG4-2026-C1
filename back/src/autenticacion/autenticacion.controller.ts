import { Controller, Post, Body } from '@nestjs/common';
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
  async login(@Body() body: any) { 
    // Acá recibp correo/username y sin encriptar
    return this.autenticacionService.loginUsuario(body);
  }
}