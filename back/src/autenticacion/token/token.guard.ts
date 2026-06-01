/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';

@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const http = context.switchToHttp();
    const req: Request = http.getRequest();
    const authorization = req.headers.authorization; // "Bearer eyj...token..."
    const token = authorization?.replace('Bearer ', '') || '';

    try {
      // 1. Verificamos que la firma sea válida
      const verificado = verify(token, process.env.CLAVE_SUPERSECRETA!); 

      // 2. Extraigo el _id en lugar del email (porque lo guarde así en el Service)
      const { _id } = verificado as { _id: string };

      if (!req.body) {
        req.body = { usuarioId: _id };
      } else {
        req.body.usuarioId = _id; 
      }

      return true; // Token válido, lo dejamos pasar.
      
    } catch (error) {
      console.error('El token no es válido o expiró:', error);
      throw new UnauthorizedException('Tu sesión expiró o no iniciaste sesión.');
    }
  }
}