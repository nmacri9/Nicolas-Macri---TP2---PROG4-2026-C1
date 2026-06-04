import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ILogin } from '../../services/auth.interfaces';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.html', 
  styleUrl: './login.css',
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);
  errorMensaje: string | null = null;

  formulario = new FormGroup({
    // le puse identificador porque puede ser correo o nombre de usuario
    identificador: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d).{8,}$') // 1 mayúscula, 1 número, mín 8 chars
    ]),
  });
  
  async accion() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorMensaje = null;

    const datosLogin: ILogin = {
      identificador: this.formulario.value.identificador || '',
      password: this.formulario.value.password || ''
    };

    try {
      const response = await this.authService.loguear(datosLogin);
      console.log('Login exitoso', response);
      this.router.navigate(['/publicaciones']);
      
      
    } catch (error: any) {
      // Atrapamos el error (ej: 401 Unauthorized o 400 Bad Request)
      this.errorMensaje = error.error?.message || "Correo/Usuario o contraseña incorrectos.";
      console.log("Detalle del error:", error);
    }
  }

  BotonCompletar (identificador: string, pass: string) {
    this.formulario.patchValue({
      identificador: identificador,
      password: pass
    });
  }
}