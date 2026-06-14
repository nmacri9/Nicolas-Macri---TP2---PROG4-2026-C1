import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const estaLogueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const token = localStorage.getItem('token'); 

  if (authService.usuarioActual() || token) {
    return true;
  } else {
    return router.navigateByUrl('/login');
  }
};

export const noEstaLogueadoGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.usuarioActual()) {
    return router.navigateByUrl('/publicaciones'); 
  } else {
    return true; 
  }
};