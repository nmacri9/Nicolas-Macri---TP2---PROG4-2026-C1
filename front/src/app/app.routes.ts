import { Routes } from '@angular/router';
import { estaLogueadoGuard, noEstaLogueadoGuard } from './guards/esta-logueado-guard';
export const routes: Routes = [

    { 
        path: 'registro', 
        loadComponent: () => import('./pantallas/registro/registro').then(m => m.Registro),
        canActivate: [noEstaLogueadoGuard],
      },
      { 
        path: 'login', 
        loadComponent: () => import('./pantallas/login/login').then(m => m.Login),
        canActivate: [noEstaLogueadoGuard],
      },
      { 
        path: 'publicaciones', 
        loadComponent: () => import('./pantallas/publicaciones/publicaciones').then(m => m.Publicaciones),
        canActivate: [estaLogueadoGuard],

      },
      { 
        path: 'mi-perfil', 
        loadComponent: () => import('./pantallas/mi-perfil/mi-perfil').then(m => m.MiPerfil),
        canActivate: [estaLogueadoGuard],

      },
     { path: '', redirectTo: 'inicio', pathMatch: 'full' }, // Ruta vacía va al inicio
];

