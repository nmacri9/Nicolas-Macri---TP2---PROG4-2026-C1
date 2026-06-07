import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Publicacion } from '../../componentes/publicacion/publicacion';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [Publicacion],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  
  private http = inject(HttpClient);
  
  miUsuarioId = localStorage.getItem('usuario_id') || '';
  listaPublicaciones: any[] = [];

  ngOnInit() {
    this.cargarFeed();
  }

  cargarFeed() {
    this.http.get<any>('https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones').subscribe({
      next: (respuesta) => {
        this.listaPublicaciones = respuesta.data.map((publi: any) => ({
          id: publi._id,
          usuario: publi.autor,
          texto: publi.descripcion,
          likes: publi.cantidadLikes,
          leDiLike: publi.likes.includes(this.miUsuarioId),
          fecha: publi.createdAt
        }));
      },
      error: (err) => console.error('Error al cargar el feed', err)
    });
  }

  manejarLike(idPublicacion: string) {
    const post = this.listaPublicaciones.find(p => p.id === idPublicacion);
    if (!post) return;

    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}/like?usuarioId=${this.miUsuarioId}`;

    if (post.leDiLike) {
      this.http.delete(url).subscribe(() => {
        post.leDiLike = false;
        post.likes -= 1;
      });
    } else {
      this.http.post(url, {}).subscribe(() => {
        post.leDiLike = true;
        post.likes += 1;
      });
    }
  }

  manejarEliminar(idPublicacion: string) {
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}?usuarioId=${this.miUsuarioId}&rol=usuario`;
    
    this.http.delete(url).subscribe({
      next: () => {
        this.listaPublicaciones = this.listaPublicaciones.filter(p => p.id !== idPublicacion);
      },
      error: (err) => console.error('Error al borrar desde el feed', err)
    });
  }
}