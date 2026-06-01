import { Component } from '@angular/core';
import { Publicacion } from '../../componentes/publicacion/publicacion';
@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [ Publicacion],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})

export class Publicaciones {

  // Nuestra lista falsa de posteos DESPUES BORRAR ESTOOOOOOOOOOOOO
  listaPublicaciones = [
    {
      id: 1,
      usuario: { nombre: 'Nico Macri', username: '@nico' },
      texto: '¡Arrancando el Sprint 2 a toda velocidad! 🚀',
      likes: 15,
      leDiLike: false,
      fecha: new Date()
    },
    {
      id: 2,
      usuario: { nombre: 'Profe', username: '@elprofe' },
      texto: 'Acordate de que la comunicación Padre-Hijo es clave para aprobar.',
      likes: 42,
      leDiLike: true,
      fecha: new Date()
    }
  ];

  // El padre escucha que el hijo emitió el evento "darLike"
  manejarLike(id: number) {
    const post = this.listaPublicaciones.find(p => p.id === id);
    if (post) {
      post.leDiLike = !post.leDiLike; 
      post.likes += post.leDiLike ? 1 : -1; // Suma o resta 1
    }
  }

  manejarEliminar(id: number) {
    this.listaPublicaciones = this.listaPublicaciones.filter(p => p.id !== id);
  }
}