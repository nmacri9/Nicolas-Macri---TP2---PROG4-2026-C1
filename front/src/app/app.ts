import { Component, OnInit, inject } from '@angular/core';
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

  cargando: boolean = true; 

  async ngOnInit() {
    try {
      await this.authService.autorizar();
      
      // 2. Si no hay error afuera el spinner
      this.cargando = false;

      // 3. Si por alguna razón estaba en login o registro, lo forzamos a entrar a publicaciones
      if (this.router.url === '/login' || this.router.url === '/registro' || this.router.url === '/') {
        this.router.navigate(['/publicaciones']);
      }
    } catch (error) {
      // Si el backend tira error (ej: 401 token vencido), lo echa
      this.cargando = false;
      this.router.navigate(['/login']);
    }
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