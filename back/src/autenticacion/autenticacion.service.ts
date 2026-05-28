import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
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

      // NestJS detecta que esto salió bien y automáticamente devuelve un Status 201 Created
      return {
        status: 'success',
        mensaje: '¡Usuario registrado correctamente en la base de datos!',
      };

    } catch (error: any) {
      if (error.code === 11000) {
        // Acá cumplimos el punto 5: Status 400 Bad Request
        throw new BadRequestException('El correo o nombre de usuario ya está registrado en el sistema.');
      }
      throw new BadRequestException('Error interno al intentar registrar el usuario.');
    }
  }

  async loginUsuario(body: any) {
    const usuario = await this.usuarioModel.findOne({
      $or: [{ correo: body.identificador }, { username: body.identificador }]
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const passwordGenerada = await bcrypt.compare(body.password, usuario.password);

    // 4. Si la contraseña no coincide, va un Status 401 Unauthorized 
    if (!passwordGenerada) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    return { 
      status: 'success',
      mensaje: 'Login exitoso',
      usuario: {
        nombre: usuario.nombre,
        correo: usuario.correo,
        username: usuario.username
      }
    };
  }
}