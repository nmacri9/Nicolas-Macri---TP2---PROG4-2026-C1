import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuarios.schema';

@Injectable()
export class AutenticacionService {
  
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) {}

  async registrarUsuario(body: CreateUsuarioDto) {
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const nuevoUsuario = new this.usuarioModel({
        ...body,
        password: hashedPassword,
      });

      await nuevoUsuario.save();

      return {
        status: 'success',
        mensaje: '¡Usuario registrado correctamente en la base de datos!',
      };

    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('El correo o nombre de usuario ya está registrado en el sistema.');
      }
      throw new BadRequestException('Error interno al intentar registrar el usuario.');
    }
  }

  async loginUsuario(body: any) {
    return { mensaje: 'Login en construcción' };
  }
}