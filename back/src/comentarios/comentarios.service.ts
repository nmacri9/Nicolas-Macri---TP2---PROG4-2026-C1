import { Injectable, NotFoundException } from '@nestjs/common';
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
    // 👈 Adaptamos los nombres para que coincidan con tu schema
    const nuevoComentario = new this.comentarioModel({
      texto: datos.texto,
      publicacion: datos.publicacionId, 
      autor: datos.usuarioId            
    });
    return nuevoComentario.save();
  }

  // PUT: Editar comentario
  async editar(id: string, nuevoTexto: string) {
    const comentario = await this.comentarioModel.findByIdAndUpdate(
      id,
      { texto: nuevoTexto, modificado: true },
      { new: true } 
    );

    if (!comentario) throw new NotFoundException('Comentario no encontrado');
    return comentario;
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