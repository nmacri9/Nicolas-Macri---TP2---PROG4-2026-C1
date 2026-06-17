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
  create(createUsuarioDto: CreateUsuarioDto) {
    return 'This action adds a new usuario';
  }

  findAll() {
    return `This action returns all usuarios`;
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
