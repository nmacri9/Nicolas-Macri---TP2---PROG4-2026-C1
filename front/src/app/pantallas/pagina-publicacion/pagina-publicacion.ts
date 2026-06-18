import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TiempoPipe } from '../../pipes/tiempo.pipe';
import { PluralizarPipe } from '../../pipes/pluralizar.pipe';
import { ResaltarComentarioDirective } from '../../directives/resaltar-comentario.directive';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { ConfirmarDirective } from '../../directives/confirmar.directive';

@Component({
  selector: 'app-pagina-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule, TiempoPipe, PluralizarPipe,
            ResaltarComentarioDirective, AutoFocusDirective, ConfirmarDirective],
  templateUrl: './pagina-publicacion.html',
  styleUrls: ['./pagina-publicacion.css']
})
export class PaginaPublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient); 
  public authService = inject(AuthService); // Cambiado a public para usarlo en el HTML
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  idPublicacion: string | null = null;
  nuevoComentario: string = '';
  miUsuarioId = this.authService.usuarioActual()?._id;
  
  datosDeLaPublicacion: any = null;
  comentarios: any[] = [];

  modalAbierto: boolean = false;
  comentarioEditando: any = null;
  textoEditado: string = '';

  paginaComentarios: number = 1;
  limiteComentarios: number = 5;

  ngOnInit() {
    this.idPublicacion = this.route.snapshot.paramMap.get('id');
    
    if (this.idPublicacion) {
      this.cargarPublicacionReal(); 
      this.cargarComentarios(true);    
    }
  }

  cargarPublicacionReal() {
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${this.idPublicacion}`;
    
    this.http.get<any>(url, { withCredentials: true }).subscribe({
      next: (respuesta) => {
        const publi = respuesta.data || respuesta;

        this.datosDeLaPublicacion = {
          id: publi._id,
          usuario: publi.autor, 
          titulo: publi.titulo,       
          imagenUrl: publi.imagenUrl,
          texto: publi.descripcion,
          likes: publi.cantidadLikes,
          leDiLike: publi.likes ? publi.likes.includes(this.miUsuarioId) : false,
          fecha: publi.createdAt
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar la publicación', err)
    });
  }

  // Lógica de borrado con confirmación
  manejarEliminar(idPublicacion: string) {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    // Ejecuta el borrado 
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}?usuarioId=${usuario._id}&rol=${usuario.perfil}`;
    
    this.http.delete(url).subscribe({
      next: () => {
        console.log('Publicación borrada con éxito');
        this.router.navigate(['/publicaciones']); 
      },
      error: (err) => console.error('Error al borrar la publicación:', err)
    });
  }

  cargarComentarios(resetear: boolean = false) {
    if (!this.idPublicacion) return;

    if (resetear) {
      this.paginaComentarios = 1;
    }

    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/comentarios/publicacion/${this.idPublicacion}?pagina=${this.paginaComentarios}&limite=${this.limiteComentarios}`;

    this.http.get<any[]>(url).subscribe({
      next: (respuesta) => {
        const comentariosTraidos = respuesta.map(c => ({
          id: c._id,
          autorId: c.autor?._id || c.autor,
          autor: c.autor?.username || 'Usuario',
          texto: c.texto,
          editado: c.modificado,
          fecha: c.createdAt
        }));

        if (resetear) {
          this.comentarios = comentariosTraidos;
        } else {
          this.comentarios = [...this.comentarios, ...comentariosTraidos];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar comentarios reales', err)
    });
  }

  cargarMasComentarios() {
    this.paginaComentarios += 1;
    this.cargarComentarios(false); 
  }

  publicarComentario() {
    if (!this.nuevoComentario.trim() || !this.idPublicacion) return;

    const body = {
      publicacionId: this.idPublicacion,
      usuarioId: this.miUsuarioId,
      texto: this.nuevoComentario
    };

    this.http.post('https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/comentarios', body).subscribe({
      next: () => {
        this.nuevoComentario = ''; 
        this.cargarComentarios(true); 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al publicar comentario', err)
    });
  }

  editarComentario(coment: any) {
    this.comentarioEditando = coment;
    this.textoEditado = coment.texto;
    this.modalAbierto = true;
  }

  puedeEditarOBorrar(coment: any): boolean {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return false;
    const esAutor = coment.autorId === usuario._id;
    const esAdmin = usuario.perfil === 'administrador';
    return esAutor || esAdmin;
  }

  esAutorDelComentario(coment: any): boolean {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return false;
    return coment.autorId === usuario._id;
  }

  eliminarComentario(coment: any) {
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/comentarios/${coment.id}?usuarioId=${usuario._id}&rol=${usuario.perfil}`;

    this.http.delete(url).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(c => c.id !== coment.id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al eliminar comentario:', err)
    });
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.comentarioEditando = null;
    this.textoEditado = '';
  }

  guardarEdicion() {
    if (this.comentarioEditando && this.textoEditado.trim() !== '') {
      if (this.textoEditado !== this.comentarioEditando.texto) {
        const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/comentarios/${this.comentarioEditando.id}`;
        const usuario = this.authService.usuarioActual();

        this.http.put(url, { texto: this.textoEditado, usuarioId: usuario?._id }).subscribe({
          next: () => {
            this.comentarioEditando.texto = this.textoEditado;
            this.comentarioEditando.editado = true;
            this.cdr.detectChanges();
            this.cerrarModal();
          },
          error: (err) => console.error('Error al editar en el backend', err)
        });
      } else {
        this.cerrarModal(); 
      }
    }
  }
}