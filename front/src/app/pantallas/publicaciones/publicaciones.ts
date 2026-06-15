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
  limit = 10;
  offset = 0;
  orden = 'fecha';


  tituloNuevaPublicacion = new FormControl('');
  textoNuevaPublicacion = new FormControl('');
  imagenNuevaPublicacion = new FormControl('');

  ngOnInit() {
    this.cargarFeed();
  }

  cargarFeed(reset: boolean = false) {
    if (reset) {
      this.offset = 0; // Si cambia de orden, vuelve a la página 1
    }

    //  parámetros al backend
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones?limit=${this.limit}&offset=${this.offset}&orden=${this.orden}`;

    this.http.get<any>(url).subscribe({
      next: (respuesta) => {
        const nuevasPublicaciones = respuesta.data.map((publi: any) => ({
          id: publi._id,
          usuario: publi.autor,
          titulo: publi.titulo,
          texto: publi.descripcion,
          likes: publi.cantidadLikes,
          leDiLike: publi.likes ? publi.likes.includes(this.miUsuarioId) : false,
          fecha: publi.createdAt
        }));

        if (reset) {
          // Si resetea pisa la lista
          this.listaPublicaciones = nuevasPublicaciones;
        } else {
          // Si es cargar mas las nuevas abajo de las viejas
          this.listaPublicaciones = [...this.listaPublicaciones, ...nuevasPublicaciones];
        }

        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al cargar el feed', err)
    });
  }

  crearPublicacion() {
    const titulo = this.tituloNuevaPublicacion.value; 
    const texto = this.textoNuevaPublicacion.value;
    const imagenUrl = this.imagenNuevaPublicacion.value;
    
    const idUsuarioActual = this.authService.usuarioActual()?._id; 

    if (!texto || !titulo || !idUsuarioActual) {
      console.error('Error: Faltan datos para publicar.');
      return;
    }

    const nuevaPubli = {
      titulo: titulo, 
      descripcion: texto, 
      autor: idUsuarioActual,
      imagenUrl: imagenUrl || ''
    };

    console.log('Enviando a Vercel...', nuevaPubli);

    this.http.post('https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones', nuevaPubli).subscribe({
      next: () => {
        this.tituloNuevaPublicacion.setValue(''); 
        this.textoNuevaPublicacion.setValue(''); 
        this.imagenNuevaPublicacion.setValue(''); 
        
        this.cargarFeed(true); // Recarga el feed y volvemos a la pag 1
      },
      error: (err) => console.error('Error al crear la publicación', err)
    });
  }

manejarLike(idPublicacion: string) {
    const post = this.listaPublicaciones.find(p => p.id === idPublicacion);
    if (!post) return;

    const idUsuarioActual = this.authService.usuarioActual()?._id;
    if (!idUsuarioActual) return;

    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${idPublicacion}/like?usuarioId=${idUsuarioActual}`;

    const operacion$ = post.leDiLike 
      ? this.http.delete(url) 
      : this.http.post(url, {});

    operacion$.subscribe({
      next: () => {
        this.cargarUnaPublicacion(idPublicacion);
      },
      error: (err) => {
        console.error('Error al procesar el like:', err);
        this.cargarUnaPublicacion(idPublicacion);
      }
    });
  }

  cargarUnaPublicacion(id: string) {
    this.http.get<any>(`https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/publicaciones/${id}`).subscribe({
      next: (respuesta) => {
        const pub = respuesta.data;
        const index = this.listaPublicaciones.findIndex(p => p.id === id);
        if (index !== -1) {
          this.listaPublicaciones[index] = {
            id: pub._id,
            usuario: pub.autor,
            texto: pub.descripcion,
            likes: pub.cantidadLikes,
            leDiLike: pub.likes.includes(this.authService.usuarioActual()?._id),
            fecha: pub.createdAt
          };
          this.cdr.detectChanges();
        }
      }
    });
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
  cambiarOrden(evento: any) {
    this.orden = evento.target.value; // Captura 'fecha' o 'likes'
    this.cargarFeed(true); // El 'true' le avisa que formatee la lista y vuelva a la pag 1
  }

  cargarMas() {
    this.offset += this.limit; 
    this.cargarFeed(false); 
  }
}