import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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

  mostrarSidebar(): boolean {
    const rutasOcultas = ['/login', '/registro'];
    return !rutasOcultas.includes(this.router.url);
  }

  CerrarSesion() {
    this.authService.CerrarSesion();
    this.router.navigate(['/login']);
  }
}