import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-estadisticas.html',
  styleUrls: ['./dashboard-estadisticas.css']
})
export class DashboardEstadisticas implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'https://nicolas-macri-tp-2-prog-4-2026-c1.vercel.app/estadisticas';

  fechaDesde = signal<string>('');
  fechaHasta = signal<string>('');

  // Variables para guardar la instancia de los gráficos y poder actualizarlos
  chartUsuarios: any;
  chartTiempo: any;
  chartPublicaciones: any;

  ngOnInit() {
    this.cargarTodo();
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  cargarTodo() {
    let queryParams = '';
    if (this.fechaDesde() || this.fechaHasta()) {
      queryParams = `?desde=${this.fechaDesde()}&hasta=${this.fechaHasta()}`;
    }

    const opciones = this.getHeaders();

    // 1. Grafico de Torta: Publicaciones por Usuario
    this.http.get<any>(`${this.apiUrl}/publicaciones-por-usuario${queryParams}`, opciones).subscribe({
      next: (res) => this.renderChartUsuarios(res.labels, res.datasets)
    });

    // 2. Grafico de Líneas: Comentarios en el tiempo
    this.http.get<any>(`${this.apiUrl}/comentarios-totales${queryParams}`, opciones).subscribe({
      next: (res) => this.renderChartTiempo(res.labels, res.datasets)
    });

    // 3. Grafico de Barras: Comentarios por publicación
    this.http.get<any>(`${this.apiUrl}/comentarios-por-publicacion${queryParams}`, opciones).subscribe({
      next: (res) => this.renderChartPublicaciones(res.labels, res.datasets)
    });
  }

  // dibujar graficos

  renderChartUsuarios(labels: string[], data: number[]) {
    if (this.chartUsuarios) this.chartUsuarios.destroy(); // Destruye el anterior si existe
    this.chartUsuarios = new Chart('canvasUsuarios', {
      type: 'pie', // TIPO TORTA
      data: {
        labels: labels.length ? labels : ['Sin datos'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: ['#1da1f2', '#17bf63', '#e0245e', '#ffad1f', '#794bc4'],
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } }
    });
  }

  renderChartTiempo(labels: string[], data: number[]) {
    if (this.chartTiempo) this.chartTiempo.destroy();
    this.chartTiempo = new Chart('canvasTiempo', {
      type: 'line', // TIPO LÍNEA
      data: {
        labels: labels.length ? labels : ['Sin datos'],
        datasets: [{
          label: 'Cantidad de comentarios',
          data: data.length ? data : [0],
          borderColor: '#17bf63',
          backgroundColor: 'rgba(23, 191, 99, 0.2)',
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } }, plugins: { legend: { labels: { color: 'white' } } } }
    });
  }

  renderChartPublicaciones(labels: string[], data: number[]) {
    if (this.chartPublicaciones) this.chartPublicaciones.destroy();
    this.chartPublicaciones = new Chart('canvasPublicaciones', {
      type: 'bar', // TIPO BARRAS
      data: {
        labels: labels.length ? labels : ['Sin datos'],
        datasets: [{
          label: 'Comentarios por Post',
          data: data.length ? data : [0],
          backgroundColor: '#1da1f2',
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } }, plugins: { legend: { labels: { color: 'white' } } } }
    });
  }
}