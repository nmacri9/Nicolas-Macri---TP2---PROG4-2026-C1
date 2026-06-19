import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.schema'; 
import { Comentario } from '../comentarios/entities/comentario.schema'; 

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<any>, 
  ) {}

  // ESTADISTICAS VIEJAS

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

  // ESTADiSTICAS PARA EL DASHBOARD

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

  // 3. Grafico torta: publicaciones por usuario en un lapso (VERSIÓN SIMPLE)
  async getPublicacionesPorUsuario(desde?: string, hasta?: string) {
    const match = this.armarFiltroFechas(desde, hasta);

    const resultados = await this.publicacionModel.aggregate([
      { $match: match },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } }
    ]);

    return {
      labels: resultados.map(r => r._id), // Devuelve el ID directamente
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

  // 5. Grafico barras: comentarios por publicacion en un lapso (VERSIÓN SIMPLE)
  async getComentariosPorPublicacion(desde?: string, hasta?: string) {
    const match = this.armarFiltroFechas(desde, hasta);

    const resultados = await this.comentarioModel.aggregate([
      { $match: match },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } }, // Ordenamos de mayor a menor
      { $limit: 10 }               // Nos quedamos con el top 10
    ]);

    return {
      labels: resultados.map(r => r._id), // Devuelve el ID de la publicación directamente
      datasets: resultados.map(r => r.cantidad)
    };
  }
}