import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IRegistro } from './auth.interfaces';
import { ILogin } from './auth.interfaces';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  private apiUrl = 'https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app'; 

  async registrar(datos: IRegistro) {
    try {
      const respuesta = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/registro`, datos)
      );
      return respuesta;
    } catch (error) {
      throw error;
    }
  }
  async loguear(datos: ILogin) {
    try {
      const respuesta = await firstValueFrom(
        this.http.post(`${this.apiUrl}/pantallas/login`, datos)
      );
      return respuesta;
    } catch (error) {
      throw error;
    }
  }

}
//prueba 