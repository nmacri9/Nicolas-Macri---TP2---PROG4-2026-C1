import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.schema'; 

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,
  ) {}

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
      .sort({ cantidadLikes: -1 }) //Ordena de mayor a menor por likes
      .limit(5)                   //Se queda solo con las primeras 5
      .select('titulo cantidadLikes'); //Trae solo lo necesario

    const labels = topPublicaciones.map(pub => pub.titulo);
    const data = topPublicaciones.map(pub => pub.cantidadLikes);

    return {
      labels,
      datasets: data
    };
  }
}