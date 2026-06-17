import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['Authorization']; 

    if (!token) {
      throw new UnauthorizedException('No tenés la cookie para entrar.');
    }

    try {
      // 1. Decodifica el token
      const payload: any = verify(token, process.env.CLAVE_SUPERSECRETA!);
      
      //Si NO es administrador, lo rebota 
      if (payload.perfil !== 'administrador') {
        throw new UnauthorizedException('Acceso denegado. Se requieren permisos de administrador.');
      }
      
      return true; // Si es admin pasa
    } catch (error) {
      throw new UnauthorizedException('Cookie inválida, vencida o sin permisos.');
    }
  }
}