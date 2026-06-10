import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  standalone: true,
  imports: [RouterModule],
  styleUrls: ['./inicio.css']
})
export class Inicio {
  constructor() {}
  // Devuelve true si el usuario está logueado
  public authService = inject(AuthService);
  }
  
