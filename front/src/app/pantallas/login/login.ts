import { Component, inject, signal } from '@angular/core'; 
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ILogin } from '../../services/auth.interfaces';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  standalone: true,
  templateUrl: './login.html', 
  styleUrl: './login.css',
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);
  
  errorMensaje = signal<string | null>(null);

  formulario = new FormGroup({
    identificador: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d).{8,}$') 
    ]),
  });
  
  async accion() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);

    const datosLogin: ILogin = {
      identificador: this.formulario.value.identificador || '',
      password: this.formulario.value.password || ''
    };

    try {
      await this.authService.loguear(datosLogin);
      
      console.log('Login exitoso');
      this.router.navigate(['/publicaciones']);
      
    } catch (error: any) {
     
      const mensaje = error.error?.message || "Usuario o contraseña incorrectos!!.";
      this.errorMensaje.set(mensaje); 
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