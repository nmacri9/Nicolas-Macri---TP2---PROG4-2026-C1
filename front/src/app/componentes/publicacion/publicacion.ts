import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './publicacion.html',
  styleUrls: ['./publicacion.css']
})
export class Publicacion {

  @Input() publicacion: any; 

  @Output() darLike = new EventEmitter<string>();
  @Output() eliminarPost = new EventEmitter<string>();

  constructor() {}
  public authService = inject(AuthService);
  // Funciones que se ejecutan al tocar los botones en el HTML
  clickLike() {
    this.darLike.emit(this.publicacion.id);
  }

  clickEliminar() {
    this.eliminarPost.emit(this.publicacion.id);
  }
}