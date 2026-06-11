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
export class PaginaPublicacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient); 
  private authService = inject(AuthService); 
  private cdr = inject(ChangeDetectorRef);

  idPublicacion: string | null = null;
  nuevoComentario: string = '';
  miUsuarioId = this.authService.usuarioActual()?._id;
  
  // Acá s guarda la publicación real cuando llegue de la API
  datosDeLaPublicacion: any = null;

  comentarios = [
    { id: 1, autor: 'Usuario1', texto: '¡Qué buena publicación!', editado: false },
    { id: 2, autor: 'Usuario2', texto: 'Totalmente de acuerdo.', editado: true }
  ];

  ngOnInit() {
    //  ID de la URL
    this.idPublicacion = this.route.snapshot.paramMap.get('id');
    
    if (this.idPublicacion) {
      this.cargarPublicacionReal();
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

  publicarComentario() {
    if (!this.nuevoComentario.trim()) return;
    this.comentarios.push({
      id: Date.now(),
      autor: 'Yo',
      texto: this.nuevoComentario,
      editado: false
    });
    this.nuevoComentario = '';
  }

  cargarMasComentarios() {
    console.log("Cargando más comentarios...");
  }

  editarComentario(coment: any) {
    const nuevoTexto = prompt("Editá tu comentario:", coment.texto);
    if (nuevoTexto && nuevoTexto !== coment.texto) {
      coment.texto = nuevoTexto;
      coment.editado = true;
    }
  }
}