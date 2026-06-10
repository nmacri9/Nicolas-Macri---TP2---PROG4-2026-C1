import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

/*SIDE BAR */ 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink], // 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  public authService = inject(AuthService)

  mostrarSidebar(): boolean {
    // Si esta en login o registro, oculto la barra
    const rutasOcultas = ['/login', '/registro'];
    return !rutasOcultas.includes(this.router.url);
  }
  CerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}