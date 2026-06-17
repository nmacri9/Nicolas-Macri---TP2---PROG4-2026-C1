import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario } from './entities/comentario.schema';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  // POST: Crear comentario
  async crear(datos: { publicacionId: string; usuarioId: string; texto: string }) {
    const nuevoComentario = new this.comentarioModel({
      texto: datos.texto,
      publicacion: datos.publicacionId,
      autor: datos.usuarioId
    });
    return nuevoComentario.save();
  }

  // PUT: Editar comentario (solo el autor puede editar el suyo)
  async editar(id: string, nuevoTexto: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(id);

    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('No podés editar un comentario que no es tuyo.');
    }

    comentario.texto = nuevoTexto;
    comentario.modificado = true;
    await comentario.save();

    return comentario;
  }

  // DELETE: Eliminar comentario (el autor o un administrador)
  async eliminar(id: string, usuarioId: string, rol: string) {
    const comentario = await this.comentarioModel.findById(id);

    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    const esAutor = comentario.autor.toString() === usuarioId;
    const esAdmin = rol === 'administrador';

    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No tenés permiso para eliminar este comentario.');
    }

    await this.comentarioModel.findByIdAndDelete(id);

    return {
      status: 'success',
      mensaje: 'Comentario eliminado correctamente'
    };
  }

  // GET: Traer comentarios de un post con paginación
  async traerPorPublicacion(publicacionId: string, pagina: number = 1, limite: number = 5) {
    const saltar = (pagina - 1) * limite;

    const comentarios = await this.comentarioModel
      .find({ publicacion: publicacionId })
      .sort({ createdAt: -1 })
      .skip(saltar)
      .limit(limite)
      .populate('autor', 'nombre apellido username imagenPerfilUrl')
      .exec();

    return comentarios;
  }
}