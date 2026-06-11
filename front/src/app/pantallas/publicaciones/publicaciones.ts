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

  tituloNuevaPublicacion = new FormControl('');
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
          titulo: publi.titulo,
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

  crearPublicacion() {
    const titulo = this.tituloNuevaPublicacion.value; 
    const texto = this.textoNuevaPublicacion.value;
    
    const idUsuarioActual = this.authService.usuarioActual()?._id; 

    if (!texto || !titulo || !idUsuarioActual) {
      console.error('Error: Faltan datos para publicar.');
      return;
    }

    const nuevaPubli = {
      titulo: titulo, 
      descripcion: texto, 
      autor: idUsuarioActual 
    };

    console.log('Enviando a Vercel...', nuevaPubli);

    this.http.post('https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones', nuevaPubli).subscribe({
      next: () => {
        this.tituloNuevaPublicacion.setValue(''); 
        this.textoNuevaPublicacion.setValue(''); 
        this.cargarFeed(); 
      },
      error: (err) => console.error('Error al crear la publicación', err)
    });
  }

 manejarLike(idPublicacion: string) {
    const post = this.listaPublicaciones.find(p => p.id === idPublicacion);
    if (!post) return;

    const idUsuarioActual = this.authService.usuarioActual()?._id;
    
    if (!idUsuarioActual) {
      alert("Error: No se detectó tu sesión. Por favor, recargá la página.");
      return;
    }

    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}/like?usuarioId=${idUsuarioActual}`;

    if (post.leDiLike) {
      // SACAR LIKE
      this.http.delete(url).subscribe({
        next: () => {
          post.leDiLike = false;
          post.likes -= 1;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al sacar el like:', err)
      });
    } else {
      // DAR LIKE
      this.http.post(url, {}).subscribe({
        next: () => {
          post.leDiLike = true;
          post.likes += 1;
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Error al dar like:', err)
      });
    }
  }

  manejarEliminar(idPublicacion: string) {
    const idUsuarioActual = this.authService.usuarioActual()?._id;
    if (!idUsuarioActual) return;

    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}?usuarioId=${idUsuarioActual}&rol=usuario`;
    
    this.http.delete(url).subscribe({
      next: () => {
        this.listaPublicaciones = this.listaPublicaciones.filter(p => p.id !== idPublicacion);
      },
      error: (err) => console.error('Error al borrar desde el feed:', err)
    });
  }
}