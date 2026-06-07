import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
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

  mostrarSidebar(): boolean {
    // Si estamos en login o registro, ocultamos la barra
    const rutasOcultas = ['/login', '/registro'];
    return !rutasOcultas.includes(this.router.url);
  }

  cerrarSesion() {
    localStorage.removeItem('usuario_id');
    this.router.navigate(['/login']);
  }
}