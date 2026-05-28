import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const repetirPassword = control.get('repetirPassword');
  return password && repetirPassword && password.value !== repetirPassword.value 
    ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  
  authService = inject(AuthService);
  router = inject(Router);

  mensajeError: string = '';
  imagenSeleccionada: File | null = null; 

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$')]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(8),
      // al menos 1 mayus, al menos 1 número y minimo 8 caracteres
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d).{8,}$') 
    ]),
    repetirPassword: new FormControl('', [Validators.required]),
    fechaNacimiento: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.maxLength(150)]),
    perfil: new FormControl('usuario', [Validators.required]) 
  }, { validators: passwordMatchValidator });

  // Función para capturar el archivo cuando el usuario lo selecciona
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
    }
  }

  async accion() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); 
      return;
    }
//
 //   if (!this.imagenSeleccionada) {
  //    this.mensajeError = 'Debes subir una imagen de perfil.';
    //  return;
    //} COMENTADO PARA UQE NO DE ERRROR

    this.mensajeError = '';

this.mensajeError = '';

    try {
        const datosUsuario = {
        nombre: this.formulario.get('nombre')?.value || '',
        apellido: this.formulario.get('apellido')?.value || '',
        correo: this.formulario.get('correo')?.value || '',
        username: this.formulario.get('username')?.value || '',
        password: this.formulario.get('password')?.value || '',
        fechaNacimiento: this.formulario.get('fechaNacimiento')?.value || '',
        descripcion: this.formulario.get('descripcion')?.value || '',
        perfil: this.formulario.get('perfil')?.value || ''
      };
      
      await this.authService.registrar(datosUsuario);
      this.router.navigate(['/login']); 

    } catch (err: any) {
      console.error('Error atrapado:', err);
      this.mensajeError = err.error?.message || 'Ocurrió un error al registrarse.';
    }
  }