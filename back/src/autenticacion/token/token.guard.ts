import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    //Buscamos el token adentro de la cookie que configuró el profe
    const token = request.cookies['Authorization']; 

    if (!token) {
      throw new UnauthorizedException('No tenés la cookie VIP para entrar.');
    }

    try {
      // Verificamos que la firma sea válida
      const payload = verify(token, process.env.CLAVE_SUPERSECRETA!);
      
      //Le pegamos los datos del usuario a la request por si el controlador los necesita
      request.body.usuarioLogueado = payload;
      
      return true; 
    } catch (error) {
      throw new UnauthorizedException('La cookie está vencida o es trucha.');
    }
  }
}