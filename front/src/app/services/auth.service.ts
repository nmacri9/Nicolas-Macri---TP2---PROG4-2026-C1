import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IRegistro, ILogin } from './auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app';

  usuarioActual = signal<any>(JSON.parse(localStorage.getItem('usuario_data') || 'null'));

  async registrar(datos: IRegistro | FormData) {
    try {
      const respuesta = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/registro`, datos, { withCredentials: true })
      );
      return respuesta;
    } catch (error) {
      throw error;
    }
  }

  async loguear(datos: ILogin) {
    try {
      const respuesta: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/login`, datos, { withCredentials: true })
      );

      if (respuesta && respuesta.token) {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario_data', JSON.stringify(respuesta.usuario));
        this.usuarioActual.set(respuesta.usuario);
      }
      return respuesta;
    } catch (error) {
      throw error;
    }
  }

  async autorizar() {
    // OJO: ya NO llamamos a CerrarSesion() en el catch.
    // Este método se usa para validar la sesión al arrancar la app.
    // Si falla (por ejemplo, por una carrera con un login recién hecho,
    // o por un token vencido), dejamos que quien llama decida qué hacer,
    // en lugar de borrar la sesión a ciegas.
    const respuesta: any = await firstValueFrom(
      this.http.post(`${this.apiUrl}/auth/autorizar`, {}, { withCredentials: true })
    );

    if (respuesta && respuesta.usuario) {
      localStorage.setItem('usuario_data', JSON.stringify(respuesta.usuario));
      this.usuarioActual.set(respuesta.usuario);
    }

    return respuesta;
  }

  async renovarSesion() {
    try {
      const respuesta: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/renovar-sesion`, {}, { withCredentials: true })
      );

      if (respuesta && respuesta.token) {
        localStorage.setItem('token', respuesta.token);
      }

      return respuesta;
    } catch (error) {
      throw error;
    }
  }

  CerrarSesion() {
    localStorage.removeItem('usuario_data');
    localStorage.removeItem('token');
    this.usuarioActual.set(null);
  }
}