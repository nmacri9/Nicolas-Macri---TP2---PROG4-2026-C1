import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

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
  usuarioTieneSesion(): boolean {
    return !!localStorage.getItem('usuario_id');
  }
  
}