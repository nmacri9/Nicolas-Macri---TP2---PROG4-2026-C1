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
    const token = localStorage.getItem('token');
    
    // Armamos las opciones de forma segura para que Angular no llore
    let opciones: any = { withCredentials: true };
    if (token) {
      opciones.headers = { Authorization: `Bearer ${token}` };
    }

    const respuesta: any = await firstValueFrom(
      this.http.post(`${this.apiUrl}/auth/autorizar`, {}, opciones)
    );

    if (respuesta && respuesta.usuario) {
      localStorage.setItem('usuario_data', JSON.stringify(respuesta.usuario));
      this.usuarioActual.set(respuesta.usuario);
    }

    return respuesta;
  }

  async renovarSesion() {
    const token = localStorage.getItem('token');
    
    let opciones: any = { withCredentials: true };
    if (token) {
      opciones.headers = { Authorization: `Bearer ${token}` };
    }

    try {
      const respuesta: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/refrescar`, {}, opciones)
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