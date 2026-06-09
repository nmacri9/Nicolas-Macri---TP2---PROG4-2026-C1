import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const estaLogueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const usuarioId = localStorage.getItem('usuario_id');

  if (usuarioId) {
    return true;
  } else {
    return router.navigateByUrl('/login');
  }
};

export const noEstaLogueadoGuard: CanActivateFn = () => {
  const router = inject(Router);

  const usuarioId = localStorage.getItem('usuario_id');

  if (usuarioId) {
    return router.navigateByUrl('/publicaciones'); 
  } else {
    return true; 
  }
};