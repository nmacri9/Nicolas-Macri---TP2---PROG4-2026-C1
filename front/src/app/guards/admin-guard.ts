import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Intentamos obtener el usuario de la señal, o del localStorage si la señal está vacía
  let usuario = authService.usuarioActual();
  if (!usuario) {
    const data = localStorage.getItem('usuario_data');
    if (data) usuario = JSON.parse(data);
  }

  if (usuario && usuario.perfil === 'administrador') {
    return true; 
  }

  // Si llegamos acá, NO es admin o NO está cargado
  router.navigate(['/publicaciones']);
  return false;
};