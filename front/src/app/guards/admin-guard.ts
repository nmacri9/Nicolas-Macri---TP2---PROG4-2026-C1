import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();

  if (usuario && usuario.perfil === 'administrador') {
    return true; 
  }

  // Si no es admin o no está logueado, lo pateamos de vuelta al inicio
  router.navigate(['/publicaciones']);
  return false;
};
