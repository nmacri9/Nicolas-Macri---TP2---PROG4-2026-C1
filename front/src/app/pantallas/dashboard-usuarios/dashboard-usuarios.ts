import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const repetirPassword = control.get('repetirPassword');
  return password && repetirPassword && password.value !== repetirPassword.value
    ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './dashboard-usuarios.html',
  styleUrls: ['./dashboard-usuarios.css']
})
export class DashboardUsuarios implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  listaUsuarios: any[] = [];
  cargando: boolean = true;
  mensajeError: string = '';
  imagenSeleccionada: File | null = null;

  // Mismo formulario que registro.ts, agregando el campo "perfil" con radio buttons
  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d).{8,}$')
    ]),
    repetirPassword: new FormControl('', [Validators.required]),
    fechaNacimiento: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.maxLength(150)]),
    perfil: new FormControl('usuario', [Validators.required]),
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.cargarUsuarios();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
    }
  }

  cargarUsuarios() {
    this.cargando = true;
    this.http.get<any>('https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios').subscribe({
      next: (respuesta) => {
        this.listaUsuarios = respuesta.data || respuesta;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(usuario: any) {
    const id = usuario._id || usuario.id;
    const url = `https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios/${id}`;

    if (usuario.activo === true) {
      this.http.delete(url).subscribe({
        next: () => { usuario.activo = false; this.cdr.detectChanges(); },
        error: (err) => console.error('Error al deshabilitar:', err)
      });
    } else {
      this.http.post(`${url}/activar`, {}).subscribe({
        next: () => { usuario.activo = true; this.cdr.detectChanges(); },
        error: (err) => console.error('Error al habilitar:', err)
      });
    }
  }

  crearUsuario() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.mensajeError = '';

    const formData = new FormData();
    formData.append('nombre', this.formulario.get('nombre')?.value || '');
    formData.append('apellido', this.formulario.get('apellido')?.value || '');
    formData.append('correo', this.formulario.get('correo')?.value || '');
    formData.append('username', this.formulario.get('username')?.value || '');
    formData.append('password', this.formulario.get('password')?.value || '');
    formData.append('fechaNacimiento', this.formulario.get('fechaNacimiento')?.value || '');
    formData.append('descripcion', this.formulario.get('descripcion')?.value || '');
    // OJO: no se manda repetirPassword, el backend no lo espera y lo rechazaría
    formData.append('perfil', this.formulario.get('perfil')?.value || 'usuario');

    if (this.imagenSeleccionada) {
      formData.append('imagenPerfil', this.imagenSeleccionada);
    }

    const url = 'https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/usuarios';

    this.http.post(url, formData).subscribe({
      next: () => {
        this.formulario.reset({ perfil: 'usuario' });
        this.imagenSeleccionada = null;
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error al crear el usuario:', err);
        this.mensajeError = err.error?.message || 'Ocurrió un error al crear el usuario.';
        this.cdr.detectChanges();
      }
    });
  }
}