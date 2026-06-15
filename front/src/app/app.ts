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
    // El 'effect' vigila si el usuario inicia o cierra sesión en tiempo real
    effect(() => {
      const usuario = this.authService.usuarioActual();
      if (usuario) {
        this.iniciarCronometro(); // Si hay usuario logueado, arranca el reloj
      } else {
        clearTimeout(this.relojAviso); // Si se desloguea, lo frenamos
      }
    });
  }

  ngOnInit() {
    this.authService.autorizar()
      .then(() => {
        // SI EL TOKEN ES VÁLIDO: Saca el spinner y entramos
        this.cargando = false;
        if (this.router.url === '/login' || this.router.url === '/registro' || this.router.url === '/') {
          this.router.navigate(['/publicaciones']);
        }
        this.cdr.detectChanges();
      })
      .catch(() => {
        //si vencio  (401): Lo mandamos al Login
        this.cargando = false;
        this.router.navigate(['/login']);
        this.cdr.detectChanges(); 
      });
  }
  // Logica del cronometro

  iniciarCronometro() {
    clearTimeout(this.relojAviso);
    // PARA LA ENTREGA FINAL (10 minutos):
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
      this.iniciarCronometro(); // vuelve a empezar el contador de 10 min de cero
      this.cdr.detectChanges();
    } catch (error) {
      this.mostrarModalRenovar = false;
      this.CerrarSesion();
    }
  }

  ignorarRenovacion() {
    this.mostrarModalRenovar = false;
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