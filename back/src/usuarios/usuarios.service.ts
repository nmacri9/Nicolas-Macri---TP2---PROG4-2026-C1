import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuarios.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
  ) {}
  async create(createUsuarioDto: CreateUsuarioDto, file?: Express.Multer.File) {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    const urlFoto = file ? file.path : undefined;

    const datosNuevoUsuario: any = {
      ...createUsuarioDto,
      password: hashedPassword,
    };

    if (urlFoto) {
      datosNuevoUsuario.imagenPerfilUrl = urlFoto;
    }

    const nuevoUsuario = new this.usuarioModel(datosNuevoUsuario);
    const usuarioGuardado = await nuevoUsuario.save();

    // No devolvemos la password en la respuesta
    const { password, ...usuarioSinPassword } = usuarioGuardado.toObject();

    return {
      status: 'success',
      mensaje: 'Usuario creado correctamente',
      usuario: usuarioSinPassword
    };
  }

  async findAll() {
    const usuarios = await this.usuarioModel.find().select('-password').exec();
    return {
      status: 'success',
      data: usuarios
    };
  }
  async findOne(id: string) {
    //  ID y que NO  devuelva la contraseña 
    const usuario = await this.usuarioModel.findById(id).select('-password').exec();
    
    if (!usuario) {
      throw new NotFoundException('El usuario no existe en la base de datos.');
    }
    
    return usuario;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  async remove(id: string) {
    const usuarioDesactivado = await this.usuarioModel.findByIdAndUpdate(
      id,
      {activo: false},
      {new: true}
    ). select('-password');

    if (!usuarioDesactivado){
      throw new NotFoundException ('El usuario no existe en la bdd.')
    }
    return {
      status: 'succes',
      mensaje: 'usuario deshailitado correctamente',
      usuario: usuarioDesactivado
    }
  }
  
  async activar(id: string) {
    const usuarioActivado = await this.usuarioModel.findByIdAndUpdate(
      id,
      { activo: true },
      { new: true }
    ).select('-password');

    if (!usuarioActivado) {
      throw new NotFoundException('El usuario no existe en la bdd.');
    }
    return {
      status: 'success',
      mensaje: 'usuario habilitado correctamente',
      usuario: usuarioActivado
    };
  }
}