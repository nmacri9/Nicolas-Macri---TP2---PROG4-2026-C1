import { Routes } from '@angular/router';

export const routes: Routes = [

    { 
        path: 'registro', 
        loadComponent: () => import('./pantallas/registro/registro').then(m => m.Registro),
      },
      { 
        path: 'login', 
        loadComponent: () => import('./pantallas/login/login').then(m => m.Login),
      },
      { 
        path: 'publicaciones', 
        loadComponent: () => import('./pantallas/publicaciones/publicaciones').then(m => m.Publicaciones),
      },
      { 
        path: 'mi-perfil', 
        loadComponent: () => import('./pantallas/mi-perfil/mi-perfil').then(m => m.MiPerfil) 
      },
     {
      path: '',
      loadComponent: () => import ('./pantallas/inicio/inicio').then(m => m.Inicio)
     }
];
