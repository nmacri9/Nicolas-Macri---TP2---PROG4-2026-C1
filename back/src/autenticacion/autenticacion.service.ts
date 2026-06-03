import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken'; 
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuarios.schema';

@Injectable()
export class AutenticacionService {
  
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) {}

  async registrarUsuario(body: CreateUsuarioDto, file?: Express.Multer.File) {
    try {
      // 1. Encriptamos la contraseña como ya hacías
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const urlFoto = file ? file.path : undefined;

      const datosNuevoUsuario: any = {
        ...body,
        password: hashedPassword,
      };

      if (urlFoto) {
        datosNuevoUsuario.imagenPerfilUrl = urlFoto; 
      }

      const nuevoUsuario = new this.usuarioModel(datosNuevoUsuario);
      await nuevoUsuario.save();

      return {
        status: 'success',
        mensaje: '¡Usuario registrado correctamente con su foto en la base de datos!',
      };

    } catch (error: any) {
      if (error.code === 11000) {
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

    if (!passwordGenerada) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    // JWT ACÁ 
    const payload = {
      _id: usuario._id,
      correo: usuario.correo,
    };

    const tokenGenerado = sign(payload, process.env.CLAVE_SECRETA!, {
      algorithm: 'HS256',
      expiresIn: '15 minutes', 
    });

    return { 
      status: 'success',
      mensaje: 'Login exitoso',
      token: tokenGenerado, // 7. Devolvemos el token al front
      usuario: {
        nombre: usuario.nombre,
        correo: usuario.correo,
        username: usuario.username
      }
    };
  }
}
