import { Component, OnInit, inject, ChangeDetectorRef, effect } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);

  private cdr = inject(ChangeDetectorRef);

  cargando: boolean = true;
  mostrarModalRenovar: boolean = false;
  relojAviso: any;

  constructor() {
    effect(() => {
      const usuario = this.authService.usuarioActual();
      if (usuario) {
        this.iniciarCronometro();
      } else {
        clearTimeout(this.relojAviso);
      }
    });
  }

  ngOnInit() {
  const esRutaPublica = this.router.url === '/login' || this.router.url === '/registro' || this.router.url === '/inicio';

  this.authService.autorizar()
    .then(() => {
      this.cargando = false;
      if (esRutaPublica) {
        this.router.navigate(['/publicaciones']);
      }
      this.cdr.detectChanges();
    })
    .catch((error) => {
      console.log("No logueado o token inválido");
      this.authService.CerrarSesion();
      this.cargando = false; // <-- Esto asegura que se apague incluso con error
      if (!esRutaPublica) {
        this.router.navigate(['/login']);
      }
      this.cdr.detectChanges();
    });
}

  iniciarCronometro() {
    clearTimeout(this.relojAviso);
    const TIEMPO_ESPERA = 10 * 60 * 1000;

    this.relojAviso = setTimeout(() => {
      this.mostrarModalRenovar = true;
      this.cdr.detectChanges();
    }, TIEMPO_ESPERA);
  }

  async extenderSesion() {
    try {
      await this.authService.renovarSesion();
      this.mostrarModalRenovar = false;
      this.iniciarCronometro();
      this.cdr.detectChanges();
    } catch (error) {
      this.mostrarModalRenovar = false;
      this.CerrarSesion();
    }
  }

  ignorarRenovacion() {
    this.mostrarModalRenovar = false;
    this.CerrarSesion();
  }

  mostrarSidebar(): boolean {
    const rutasOcultas = ['/login', '/registro'];
    return !rutasOcultas.includes(this.router.url);
  }

  CerrarSesion() {
    this.authService.CerrarSesion();
    this.router.navigate(['/login']);
  }
}