import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.schema'; 
import { Comentario } from '../comentarios/entities/comentario.schema'; // <-- IMPORTANTE: Necesario para las stats nuevas

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<any>, // <-- Inyectamos el modelo de comentarios
  ) {}

  //stats "viejas"

  // 1. Grafico torta (Activas e Inactivas)
  async getEstadoPublicaciones() {
    const activas = await this.publicacionModel.countDocuments({ activo: true });
    const inactivas = await this.publicacionModel.countDocuments({ activo: false });

    return {
      labels: ['Activas', 'Inactivas'],
      datasets: [activas, inactivas] 
    };
  }

  // 2. grafico de Barras 
  async getTopPublicaciones() {
    const topPublicaciones = await this.publicacionModel
      .find({ activo: true })
      .sort({ cantidadLikes: -1 })
      .limit(5)
      .select('titulo cantidadLikes'); 

    const labels = topPublicaciones.map(pub => pub.titulo);
    const data = topPublicaciones.map(pub => pub.cantidadLikes);

    return { labels, datasets: data };
  }


  // stats ´para el Dashboard

  // Función auxiliar para filtrar por fechas
  private armarFiltroFechas(desde?: string, hasta?: string) {
    const filtro: any = {};
    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (hasta) {
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fechaHasta;
      }
    }
    return filtro;
  }

  // 3. Grafico torta: publicaciones por usuario en un lapso
  async getPublicacionesPorUsuario(desde?: string, hasta?: string) {
    const match = this.armarFiltroFechas(desde, hasta);

    const resultados = await this.publicacionModel.aggregate([
      { $match: match },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'usuarios', 
          localField: '_id',
          foreignField: '_id',
          as: 'datosUsuario'
        }
      },
      { $unwind: '$datosUsuario' },
      { $project: { _id: 0, usuario: '$datosUsuario.username', cantidad: 1 } }
    ]);

    return {
      labels: resultados.map(r => r.usuario),
      datasets: resultados.map(r => r.cantidad)
    };
  }

  // 4. Grafico líneas: comentarios totales en un lapso
  async getComentariosTotales(desde?: string, hasta?: string) {
    const match = this.armarFiltroFechas(desde, hasta);

    const resultados = await this.comentarioModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } 
    ]);

    return {
      labels: resultados.map(r => r._id),
      datasets: resultados.map(r => r.cantidad) 
    };
  }

  // 5. Grafico barras: comentarios por publicacion en un lapso
  async getComentariosPorPublicacion(desde?: string, hasta?: string) {
    const match = this.armarFiltroFechas(desde, hasta);

    const resultados = await this.comentarioModel.aggregate([
      { $match: match },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'publicacions', 
          localField: '_id',
          foreignField: '_id',
          as: 'datosPublicacion'
        }
      },
      { $unwind: '$datosPublicacion' },
      { $project: { _id: 0, titulo: '$datosPublicacion.titulo', cantidad: 1 } },
      { $sort: { cantidad: -1 } }, 
      { $limit: 10 } 
    ]);

    return {
      labels: resultados.map(r => r.titulo),
      datasets: resultados.map(r => r.cantidad)
    };
  }
}