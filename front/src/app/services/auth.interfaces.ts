
export interface IRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  password?: string; 
  fechaNacimiento: string; // Formato YYYY-MM-DD del input date
  descripcion?: string;
  perfil: string;
}

export interface ILogin {
  identificador: string; 
  password: string;
}