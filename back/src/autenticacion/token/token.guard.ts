import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    const authHeader = request.headers.authorization; 

    if (!authHeader) {
      throw new UnauthorizedException('No enviaste el token para entrar.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Formato de token inválido.');
    }

    try {
      const payload: any = verify(token, process.env.CLAVE_SECRETA!);
      
      if (payload.perfil !== 'administrador') {
        throw new UnauthorizedException('Acceso denegado. Se requieren permisos de administrador.');
      }


      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido, vencido o sin permisos.');
    }
  }
}