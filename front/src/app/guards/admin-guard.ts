import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const usuario = authService.usuarioActual() ?? JSON.parse(localStorage.getItem('usuario_data') || 'null');

  if (usuario && usuario.perfil === 'administrador') {
    return true;
  }

  router.navigate(['/publicaciones']);
  return false;
};