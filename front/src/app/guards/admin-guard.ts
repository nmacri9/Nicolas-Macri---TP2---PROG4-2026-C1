import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 1. Buscamos directo en el localStorage, que es lo más rápido y seguro ahora
  const data = localStorage.getItem('usuario_data');
  const usuario = data ? JSON.parse(data) : null;

  // 2. Verificamos si existe y es administrador
  if (usuario && usuario.perfil === 'administrador') {
    return true; 
  }

  // Si no es admin, no lo dejes pasar
  router.navigate(['/publicaciones']);
  return false;
};