import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Publicacion } from '../../componentes/publicacion/publicacion';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [Publicacion], 
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfil implements OnInit { 
  
  private http = inject(HttpClient);
  miUsuarioId = localStorage.getItem('usuario_id') || '';
  usuarioPerfil = {
    nombre: '',
    username: '',
    correo: '',
    biografia: '',
    imagenPerfilUrl: 'assets/avatar-por-defecto.png', 
    fechaUnion: 'Junio 2026'
  };

  misPublicaciones: any[] = []; 

  ngOnInit() {
    this.cargarDatosUsuario();
    this.cargarMisPublicaciones();
  }

  cargarDatosUsuario() {
    this.http.get<any>(`https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios/${this.miUsuarioId}`).subscribe({
      next: (usuarioDeMongo) => {
        this.usuarioPerfil = {
          nombre: `${usuarioDeMongo.nombre} ${usuarioDeMongo.apellido}`,
          username: `@${usuarioDeMongo.username}`,
          correo: usuarioDeMongo.correo,
          biografia: usuarioDeMongo.descripcion || '¡Hola! Estoy usando esta red social.',
          imagenPerfilUrl: usuarioDeMongo.imagenPerfilUrl || 'assets/avatar-por-defecto.png', 
          fechaUnion: 'Junio 2026' 
        };
      },
      error: (err) => console.error('Error al traer datos del usuario', err)
    });
  }

  // --- Trae ultimas 3 publicaciones  ---
  cargarMisPublicaciones() {
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones?autor=${this.miUsuarioId}&limit=3`;
    this.http.get<any>(url).subscribe({
      next: (respuesta) => {
        this.misPublicaciones = respuesta.data.map((publi: any) => {
          return {
            id: publi._id,
            usuario: publi.autor,
            texto: publi.descripcion,
            likes: publi.cantidadLikes,
            leDiLike: publi.likes.includes(this.miUsuarioId),
            fecha: publi.createdAt
          };
        });
      },
      error: (err) => console.error('Error al traer publicaciones', err)
    });
  }

  manejarLike(idPublicacion: string) {
    const post = this.misPublicaciones.find(p => p.id === idPublicacion);
    if (!post) return;

    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}/like?usuarioId=${this.miUsuarioId}`;

    if (post.leDiLike) {
      // Si ya le dieron like, DELETE para sacarlo
      this.http.delete(url).subscribe(() => {
        post.leDiLike = false;
        post.likes -= 1;
      });
    } else {
      // Si no le dio like, POST para agregarlo
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
        // Si el back lo borró con éxito, lo saco de la pantalla
        this.misPublicaciones = this.misPublicaciones.filter(p => p.id !== idPublicacion);
      },
      error: (err) => console.error('Error al borrar', err)
    });
  }
}