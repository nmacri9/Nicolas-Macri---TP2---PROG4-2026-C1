import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken'; 
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
      perfil: usuario.perfil || 'usuario'
    };

    const tokenGenerado = sign(payload, process.env.CLAVE_SECRETA!, {
      algorithm: 'HS256',
      expiresIn: '15 minutes', 
    });

    return { 
      status: 'success',
      mensaje: 'Login exitoso',
      token: tokenGenerado,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        username: usuario.username,
        correo: usuario.correo,
        perfil: usuario.perfil || 'usuario', 
        descripcion: usuario.descripcion,
        imagenPerfilUrl: usuario.imagenPerfilUrl
      }
    };
  }

  async validarToken(token: string) {
    try {
      //verifica jwt
      const payloadDecodificado: any = verify(token, process.env.CLAVE_SECRETA!);
      
      const usuario = await this.usuarioModel.findById(payloadDecodificado._id);
      if (!usuario) {
        throw new UnauthorizedException('El usuario ya no existe en la base de datos.');
      }

      return {
        status: 'success',
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          username: usuario.username,
          correo: usuario.correo,
          perfil: usuario.perfil || 'usuario',
          descripcion: usuario.descripcion,
          imagenPerfilUrl: usuario.imagenPerfilUrl
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado. Por favor, iniciá sesión nuevamente.');
    }
  }

  // GENERA  NUEVO TOKEN 
  async refrescarToken(token: string) {
    try {
      const payloadDecodificado: any = verify(token, process.env.CLAVE_SECRETA!, { ignoreExpiration: true });

      const nuevoPayload = {
        _id: payloadDecodificado._id,
        correo: payloadDecodificado.correo,
        perfil: payloadDecodificado.perfil || 'usuario'
      };

      const nuevoToken = sign(nuevoPayload, process.env.CLAVE_SECRETA!, {
        algorithm: 'HS256',
        expiresIn: '15 minutes', 
      });

      return {
        status: 'success',
        token: nuevoToken
      };
    } catch (error) {
      throw new UnauthorizedException('No se pudo refrescar la sesión de forma segura.');
    }
  }
}

