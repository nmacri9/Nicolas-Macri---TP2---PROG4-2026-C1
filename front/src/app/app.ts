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

    // Si ya hay un usuario en el signal (por ejemplo, justo se logueó,
    // o ya había datos guardados de una sesión previa en localStorage),
    // no hace falta pegarle al backend para autorizar de nuevo.
    // Esto evita la carrera entre este chequeo inicial y un login recién hecho.
    if (this.authService.usuarioActual()) {
      this.cargando = false;
      return;
    }

    this.authService.autorizar()
      .then(() => {
        this.cargando = false;
        if (esRutaPublica) {
          this.router.navigate(['/publicaciones']);
        }
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.log("Autorización inicial fallida o no necesaria:", error);
        this.cargando = false;
        // Solo expulsamos si intentábamos acceder a una ruta protegida.
        // Si autorizar() falla, recién ahí limpiamos cualquier resto de sesión inválida.
        this.authService.CerrarSesion();
        if (!esRutaPublica) {
          this.router.navigate(['/login']);
        }
        this.cdr.detectChanges();
      });
  }

  iniciarCronometro() {
    clearTimeout(this.relojAviso);
    // const TIEMPO_ESPERA = 10 * 60 * 1000;
    const TIEMPO_ESPERA = 5000;

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