import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './dashboard-usuarios.html',
  styleUrls: ['./dashboard-usuarios.css']
})
export class DashboardUsuarios implements OnInit {
  private http = inject(HttpClient);
  
  listaUsuarios: any[] = [];
  cargando: boolean = true;
  nuevoNombre = new FormControl('');
  nuevoEmail = new FormControl('');
  nuevaPassword = new FormControl('');
  nuevoPerfil = new FormControl('usuario');

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.http.get<any>('https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios').subscribe({
      next: (respuesta) => {
        this.listaUsuarios = respuesta.data || respuesta; 
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
      }
    });
  }

  cambiarEstado(usuario: any) {
    const id = usuario._id || usuario.id;
    
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios/${id}`;


    if (usuario.activo === true) {
      
      this.http.delete(url).subscribe({
        next: () => usuario.activo = false,
        error: (err) => console.error('Error al deshabilitar:', err)
      });

    } else {
      
      
      this.http.post(`${url}/activar`, {}).subscribe({
        next: () => usuario.activo = true,
        error: (err) => console.error('Error al habilitar:', err)
      });

    }
  }
  crearUsuario() {
    // 1. Armamos el paquete con los valores que escribió el admin
    const nuevoUsuario = {
      nombre: this.nuevoNombre.value,
      email: this.nuevoEmail.value,
      password: this.nuevaPassword.value,
      perfil: this.nuevoPerfil.value
    };

    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password) {
      alert('Por favor, completá todos los campos.');
      return;
    }

    const url = 'https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios';

    this.http.post(url, nuevoUsuario).subscribe({
      next: () => {
        console.log('¡Usuario creado con éxito!');
        
        this.nuevoNombre.setValue('');
        this.nuevoEmail.setValue('');
        this.nuevaPassword.setValue('');
        this.nuevoPerfil.setValue('usuario'); 
        
        this.cargarUsuarios();
      },
      error: (err) => console.error('Error al crear el usuario:', err)
    });
  }
}