import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // --- DEBUG AGRESIVO ---
  const token = localStorage.getItem('token');
  console.log("Interceptor: Token en localStorage es:", token);

  if (token) {
    console.log("Interceptor: ¡Token detectado! Adjuntando header...");
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else {
    console.warn("Interceptor: NO HAY TOKEN en localStorage.");
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error("Interceptor: Error 401 detectado, cerrando sesión...");
        authService.CerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};