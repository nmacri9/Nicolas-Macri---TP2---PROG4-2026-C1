import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePublicacionDto } from './dto/create-publicaciones.dto';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.schema'; 
import { Comentario, ComentarioSchema } from 'src/comentarios/entities/comentario.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
  ) {}

  async create(createPublicacionDto: CreatePublicacionDto) {
    try {
      const nuevaPublicacion = new this.publicacionModel(createPublicacionDto);
      
      const publicacionGuardada = await nuevaPublicacion.save();
      
      return {
        status: 'success',
        mensaje: '¡Publicación creada con éxito!',
        data: publicacionGuardada
      };
    } catch (error: any) {
      throw new BadRequestException('No se pudo crear la publicación: ' + error.message);
    }
  }
  async findAll(opciones: { limit: number; offset: number; orden: 'fecha' | 'likes'; autor?: string }) {
    try {
      const { limit, offset, orden, autor } = opciones;

      // traigo publicaciones
      const filtro: any = { activo: true };
      if (autor) {
        filtro.autor = autor;
      }

      // descendente (de mayor a menor)
      const criterioOrden: any = {};
      if (orden === 'likes') {
        criterioOrden.cantidadLikes = -1; // Más populares primero
      } else {
        criterioOrden.createdAt = -1; // Mas recientes primero (por fecha de creación)
      }

      const publicaciones = await this.publicacionModel.find(filtro)
        .sort(criterioOrden) 
        .skip(offset)        
        .limit(limit)        
        .populate('autor', 'nombre apellido username imagenPerfilUrl fotoPerfil') 
        .exec();

      const total = await this.publicacionModel.countDocuments(filtro).exec();

      return {
        status: 'success',
        total,
        limit,
        offset,
        data: publicaciones
      };

    } catch (error: any) {
      throw new BadRequestException('No se pudieron listar las publicaciones: ' + error.message);
    }
  }

  async findOne(id: string) {
    try {
      // Busco la publicación por ID y que esté activa, trayendo los datos del autor
      const publicacion = await this.publicacionModel.findOne({ _id: id, activo: true })
      .populate('autor', 'nombre apellido username imagenPerfilUrl fotoPerfil') 
      .exec();
      if (!publicacion) {
        throw new BadRequestException('La publicación no existe o fue eliminada.');
      }

      return {
        status: 'success',
        data: publicacion
      };

    } catch (error: any) {
      throw new BadRequestException('No se pudo encontrar la publicación: ' + error.message);
    }
  }


  async update(id: string, updatePublicacionDto: any) {
    try {
      const publicacionActualizada = await this.publicacionModel.findByIdAndUpdate(
        id, 
        updatePublicacionDto, 
        { new: true }
      ).exec();

      if (!publicacionActualizada) {
        throw new BadRequestException('No se encontró la publicación para actualizar.');
      }

      return {
        status: 'success',
        mensaje: 'Publicación actualizada correctamente',
        data: publicacionActualizada
      };
    } catch (error: any) {
      throw new BadRequestException('No se pudo actualizar la publicación: ' + error.message);
    }
  }

  async remove(idPublicacion: string, idUsuarioSolicitante: string, rolUsuario: string) {
    try {
      const publicacion = await this.publicacionModel.findById(idPublicacion);

      if (!publicacion) {
        throw new BadRequestException('La publicación no fue encontrada.');
      }

      const idAutorDeLaPublicacion = publicacion.autor.toString();

      // Validación de permisos (¡Esto ya lo tenés perfecto!)
      if (idAutorDeLaPublicacion !== idUsuarioSolicitante && rolUsuario !== 'administrador') {
        throw new BadRequestException('No tienes permiso para eliminar esta publicación. Solo el autor o un admin pueden hacerlo.');
      }

      // 3. Apagamos la publicación
      publicacion.activo = false;
      await publicacion.save();
      await this.comentarioModel.deleteMany({ publicacion: idPublicacion });

      return {
        status: 'success',
        mensaje: 'Publicación y sus comentarios eliminados correctamente'
      };

    } catch (error: any) {
      throw new BadRequestException('No se pudo eliminar la publicación: ' + error.message);
    }
  }
  // SISTEMA DE LIKES 

  async darLike(idPublicacion: string, idUsuario: string) {
    try {
      // Si la publi no existe o se borro (activo: false), corto acá.
      const publicacion = await this.publicacionModel.findById(idPublicacion);
      if (!publicacion || !publicacion.activo) {
        throw new BadRequestException('La publicación no existe o fue eliminada.');
      }

      const yaLeDioLike = publicacion.likes.some(id => id.toString() === idUsuario);
      if (yaLeDioLike) {
        throw new BadRequestException('Ya le diste me gusta a esta publicación.'); // Cumple la regla de "un solo like"
      }

  
      publicacion.likes.push(idUsuario as any);
      publicacion.cantidadLikes += 1;

      await publicacion.save();
      return { status: 'success', mensaje: '¡Me gusta agregado!' };

    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException('Error al dar like');
    }
  }

  async quitarLike(idPublicacion: string, idUsuario: string) {
    try {
      // 1. Busco la publicación igual que antes.
      const publicacion = await this.publicacionModel.findById(idPublicacion);
      if (!publicacion || !publicacion.activo) {
        throw new BadRequestException('La publicación no existe o fue eliminada.');
      }

      const yaLeDioLike = publicacion.likes.some(id => id.toString() === idUsuario);
      if (!yaLeDioLike) {
        throw new BadRequestException('No le habías dado me gusta a esta publicación antes.');
      }

     
      publicacion.likes = publicacion.likes.filter(id => id.toString() !== idUsuario) as any;
      publicacion.cantidadLikes -= 1;

      // 4. Guardo en MongoDB
      await publicacion.save();
      return { status: 'success', mensaje: 'Me gusta eliminado.' };

    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw new BadRequestException('Error al quitar like');
    }
  }
}