import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('token');

  // Si hay token, lo inyectamos. Si no, dejamos que la petición pase sin header.
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend nos dice 401, es que el token venció o es inválido
      if (error.status === 401) {
        authService.CerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};