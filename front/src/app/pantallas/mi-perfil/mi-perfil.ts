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

  constructor() {
    effect(() => {
      const usuario = this.authService.usuarioActual();
      if (usuario?._id) {
        this.cargarDatosUsuario(usuario._id);
        this.cargarMisPublicaciones(usuario._id);
      }
    });
  }

  cargarDatosUsuario(id: string) {
    this.http.get<any>(`https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios/${id}`).subscribe({
      next: (usuarioDeMongo) => {
        this.usuarioPerfil.set({
          nombre: `${usuarioDeMongo.nombre} ${usuarioDeMongo.apellido}`,
          username: `@${usuarioDeMongo.username}`,
          correo: usuarioDeMongo.correo,
          biografia: usuarioDeMongo.descripcion || '¡Hola! Estoy usando esta red social.',
          imagenPerfilUrl: usuarioDeMongo.imagenPerfilUrl || 'assets/avatar-por-defecto.png', 
          fechaUnion: 'Junio 2026' 
        });
      },
      error: (err) => console.error('Error al traer datos del usuario', err)
    });
  }

  cargarMisPublicaciones(id: string) {
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones?autor=${id}&limit=3`;
    this.http.get<any>(url).subscribe({
      next: (respuesta) => {
        const mapeadas = respuesta.data.map((publi: any) => {
          return {
            id: publi._id,
            usuario: publi.autor,
            texto: publi.descripcion,
            likes: publi.cantidadLikes,
            leDiLike: publi.likes.includes(id),
            fecha: publi.createdAt
          };
        });
        // 🌟 Guardamos las publicaciones reactivamente
        this.misPublicaciones.set(mapeadas);
      },
      error: (err) => console.error('Error al traer publicaciones', err)
    });
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
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}?usuarioId=${idActual}&rol=usuario`;
    
    this.http.delete(url).subscribe({
      next: () => {
        this.misPublicaciones.update(posts => posts.filter(p => p.id !== idPublicacion));
      },
      error: (err) => console.error('Error al borrar', err)
    });
  }
}