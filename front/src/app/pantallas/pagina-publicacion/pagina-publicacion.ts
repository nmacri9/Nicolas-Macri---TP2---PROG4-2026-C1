import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-pagina-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagina-publicacion.html',
  styleUrls: ['./pagina-publicacion.css']
})
export class PaginaPublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient); 
  private authService = inject(AuthService); 
  private cdr = inject(ChangeDetectorRef);

  idPublicacion: string | null = null;
  nuevoComentario: string = '';
  miUsuarioId = this.authService.usuarioActual()?._id;
  
  datosDeLaPublicacion: any = null;
  comentarios: any[] = [];

  modalAbierto: boolean = false;
  comentarioEditando: any = null;
  textoEditado: string = '';

  ngOnInit() {
    this.idPublicacion = this.route.snapshot.paramMap.get('id');
    
    if (this.idPublicacion) {
      this.cargarPublicacionReal(); 
      this.cargarComentarios();     
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
          texto: publi.descripcion,
          likes: publi.cantidadLikes,
          leDiLike: publi.likes ? publi.likes.includes(this.miUsuarioId) : false,
          fecha: publi.createdAt
        };

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la publicación desde el backend', err);
      }
    });
  }

  cargarComentarios() {
    if (!this.idPublicacion) return;
    const guardados = localStorage.getItem(`comentarios_${this.idPublicacion}`);
    if (guardados) {
      this.comentarios = JSON.parse(guardados);
    }
  }

  publicarComentario() {
    if (!this.nuevoComentario.trim()) return;

    this.comentarios.push({
      id: Date.now().toString(),
      autor: this.authService.usuarioActual()?.username || 'Usuario',
      texto: this.nuevoComentario,
      editado: false
    });

    if (this.idPublicacion) {
      localStorage.setItem(`comentarios_${this.idPublicacion}`, JSON.stringify(this.comentarios));
    }
    
    this.nuevoComentario = ''; 
  }

  editarComentario(coment: any) {
    this.comentarioEditando = coment;
    this.textoEditado = coment.texto; 
    this.modalAbierto = true; 
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.comentarioEditando = null;
    this.textoEditado = '';
  }

  guardarEdicion() {
    if (this.comentarioEditando && this.textoEditado.trim() !== '') {
      if (this.textoEditado !== this.comentarioEditando.texto) {
        this.comentarioEditando.texto = this.textoEditado;
        this.comentarioEditando.editado = true;
        
        if (this.idPublicacion) {
          localStorage.setItem(`comentarios_${this.idPublicacion}`, JSON.stringify(this.comentarios));
        }
      }
      this.cerrarModal(); 
    }
  }

  cargarMasComentarios() {
    console.log("Todos los comentarios locales ya están cargados.");
  }
}