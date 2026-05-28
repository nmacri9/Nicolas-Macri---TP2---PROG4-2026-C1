import { Routes } from '@angular/router';

export const routes: Routes = [

    { 
        path: 'registro', 
        loadComponent: () => import('./registro/registro').then(m => m.Registro),
      },
      { 
        path: 'login', 
        loadComponent: () => import('./login/login').then(m => m.Login),
      },
      { 
        path: 'publicaciones', 
        loadComponent: () => import('./publicaciones/publicaciones').then(m => m.Publicaciones),
      },
      { 
        path: 'mi-perfil', 
        loadComponent: () => import('./mi-perfil/mi-perfil').then(m => m.MiPerfil) 
      },
];
