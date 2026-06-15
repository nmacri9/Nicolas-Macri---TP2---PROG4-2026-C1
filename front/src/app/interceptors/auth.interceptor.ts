import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde con 401 
      if (error.status === 401) {
        authService.CerrarSesion(); // limpia los datos guardados
        router.navigate(['/login']); // de nuevo al login
      }
      return throwError(() => error);
    })
  );
};