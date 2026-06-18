import { Component, inject, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Publicacion } from '../../componentes/publicacion/publicacion';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [Publicacion, CommonModule], 
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfil { 
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  
  usuarioPerfil = signal<any>({
    nombre: 'Cargando...',
    username: '...',
    correo: '',
    biografia: 'Cargando...',
    imagenPerfilUrl: 'assets/avatar-por-defecto.png', 
    fechaUnion: ''
  });

  misPublicaciones = signal<any[]>([]); 
  totalPosts = signal(0); 


  limit = 3;
  offset = 0;

  constructor() {
    effect(() => {
      const usuario = this.authService.usuarioActual();
      if (usuario?._id) {
        this.cargarDatosUsuario(usuario._id);
        this.cargarMisPublicaciones(usuario._id, true);
      }
    });
  }

  cargarDatosUsuario(id: string) {
    this.http.get<any>(`https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios/${id}`).subscribe({
      next: (usuarioDeMongo) => {
        this.usuarioPerfil.set(usuarioDeMongo);
      }
    });
  }

  cargarMisPublicaciones(id: string, reset: boolean = false) {
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones?autor=${id}&limit=${this.limit}&offset=${this.offset}`;
    
    this.http.get<any>(url).subscribe({
      next: (respuesta) => {
        // Guardamos el total que devuelve el backend
        this.totalPosts.set(respuesta.total); 

        const mapeadas = respuesta.data.map((publi: any) => ({
            id: publi._id,
            titulo: publi.titulo,
            contenido: publi.contenido,
            likes: publi.cantidadLikes,
            leDiLike: publi.likes.includes(this.authService.usuarioActual()?._id),
            fecha: publi.fecha
        }));

        if (reset) {
          this.misPublicaciones.set(mapeadas);
        } else {
          this.misPublicaciones.update(lista => [...lista, ...mapeadas]);
        }
      },
      error: (err) => console.error('Error al traer publicaciones', err)
    });
  }

  cargarMas() {
    const usuario = this.authService.usuarioActual();
    if (usuario?._id) {
      this.offset += this.limit;
      this.cargarMisPublicaciones(usuario._id, false);
    }
  }

  manejarLike(idPublicacion: string) {
    const post = this.misPublicaciones().find(p => p.id === idPublicacion);
    if (!post) return;

    const idActual = this.authService.usuarioActual()?._id;
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}/like?usuarioId=${idActual}`;

    if (post.leDiLike) {
      this.http.delete(url).subscribe(() => {
        this.misPublicaciones.update(lista => 
          lista.map(p => p.id === idPublicacion ? { ...p, leDiLike: false, likes: p.likes - 1 } : p)
        );
      });
    } else {
      this.http.post(url, {}).subscribe(() => {
        this.misPublicaciones.update(lista => 
          lista.map(p => p.id === idPublicacion ? { ...p, leDiLike: true, likes: p.likes + 1 } : p)
        );
      });
    }
  }

  manejarEliminar(idPublicacion: string) {
    const idActual = this.authService.usuarioActual()?._id;
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}?usuarioId=${idActual}`;
    this.http.delete(url).subscribe(() => {
        this.misPublicaciones.update(lista => lista.filter(p => p.id !== idPublicacion));
    });
  }
}