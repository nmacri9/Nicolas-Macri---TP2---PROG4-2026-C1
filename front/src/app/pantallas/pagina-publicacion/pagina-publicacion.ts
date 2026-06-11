import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publicacion } from '../../componentes/publicacion/publicacion'; 

@Component({
  selector: 'app-pagina-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule, Publicacion], 
  templateUrl: './pagina-publicacion.html',
  styleUrls: ['./pagina-publicacion.css']
})
export class PaginaPublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  
  idPublicacion: string | null = null;
  nuevoComentario: string = '';
  
  // Objeto provisorio para que tu componente <app-publicacion> no tire error
  // (Después lo reemplazás por el fetch a tu base de datos)
  datosDeLaPublicacion = {
    id: '',
    usuario: 'Cargando...',
    texto: 'Cargando contenido de la publicación...',
    likes: 0,
    leDiLike: false,
    fecha: new Date()
  };

  comentarios = [
    { id: 1, autor: 'Usuario1', texto: '¡Qué buena publicación!', editado: false },
    { id: 2, autor: 'Usuario2', texto: 'Totalmente de acuerdo.', editado: true }
  ];

  ngOnInit() {
    this.idPublicacion = this.route.snapshot.paramMap.get('id');
    this.datosDeLaPublicacion.id = this.idPublicacion || '';
  }

  // Funciones para que no tiren error los @Outputs 
  manejarLike(id: string) { console.log("Like en publi grande", id); }
  manejarEliminar(id: string) { console.log("Eliminar publi grande", id); }

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