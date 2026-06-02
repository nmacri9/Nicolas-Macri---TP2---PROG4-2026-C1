import { Component } from '@angular/core';
import { Publicacion } from '../../componentes/publicacion/publicacion';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [Publicacion], 
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfil {
  // 1. Datos del usuario logueado
  usuarioPerfil = {
    nombre: 'Nico Macri',
    username: '@nico_macri',
    correo: 'nico@gmail.com',
    biografia: 'Estudiante de Programación IV. Construyendo mi propio X. 🚀',
    fechaUnion: 'Junio 2026'
  };

  // 2.  últimas 3 publicaciones falsas DESPUES BORRAAAR
  misPublicaciones = [
    {
      id: 10,
      usuario: { nombre: 'Nico Macri', username: '@nico_macri' },
      texto: '¡Terminando el Sprint 2 del TP! El backend ya guarda cookies como un campeón. 🍪',
      likes: 24,
      leDiLike: false,
      fecha: new Date()
    },
    {
      id: 11,
      usuario: { nombre: 'Nico Macri', username: '@nico_macri' },
      texto: 'Angular 18 con la nueva sintaxis @for es un viaje de ida.',
      likes: 12,
      leDiLike: true,
      fecha: new Date()
    },
    {
      id: 12,
      usuario: { nombre: 'Nico Macri', username: '@nico_macri' },
      texto: 'Primer post de prueba desde mi perfil.',
      likes: 5,
      leDiLike: false,
      fecha: new Date()
    }
  ];

  // Funciones para escuchar al hijo (igual que en el Feed)
  manejarLike(id: number) {
    const post = this.misPublicaciones.find(p => p.id === id);
    if (post) {
      post.leDiLike = !post.leDiLike;
      post.likes += post.leDiLike ? 1 : -1;
    }
  }

  manejarEliminar(id: number) {
    this.misPublicaciones = this.misPublicaciones.filter(p => p.id !== id);
  }
}