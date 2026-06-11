import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; 
import { Publicacion } from '../../componentes/publicacion/publicacion';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [Publicacion, ReactiveFormsModule], 
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); 
  
  miUsuarioId = this.authService.usuarioActual()?._id;  
  listaPublicaciones: any[] = [];

  // 👈 CONTROL PARA LA CAJA DE TEXTO
  textoNuevaPublicacion = new FormControl('');

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
          leDiLike: publi.likes ? publi.likes.includes(this.miUsuarioId) : false,
          fecha: publi.createdAt
        }));

        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al cargar el feed', err)
    });
  }

  // 👈 FUNCIÓN PARA CREAR POSTEO
  crearPublicacion() {
    const texto = this.textoNuevaPublicacion.value;
    if (!texto || !this.miUsuarioId) return;

    // Armamos los datos tal cual los espera tu backend (descripcion y autor)
    const nuevaPubli = {
      descripcion: texto, 
      autor: this.miUsuarioId 
    };

    this.http.post('https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones', nuevaPubli).subscribe({
      next: () => {
        this.textoNuevaPublicacion.setValue(''); 
        this.cargarFeed(); 
      },
      error: (err) => console.error('Error al crear la publicación', err)
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