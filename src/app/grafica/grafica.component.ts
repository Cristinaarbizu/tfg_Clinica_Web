import { Component } from '@angular/core';
import { CitaService, Cita } from '../services/cita.service';
import { Timestamp } from 'firebase/firestore';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.component.html',
  styleUrls: ['./grafica.component.scss'],
  standalone: true,
  imports: [BaseChartDirective, FormsModule]
})
export class GraficaComponent {
  agrupacion: 'week' | 'month' | 'year' = 'week';

  chartData: ChartDataset<'line', number[]>[] = [
    { data: [], label: 'Citas' }
  ];

  chartLabels: string[] = [];

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Citas por periodo' }
    },
    scales: {
      x: {
        title: { display: true, text: 'Periodo' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Número de citas' },
        suggestedMax: 28, 
        ticks: {
          stepSize: 4,     
          precision: 0,
          callback: function(value) {
            return Number(value);
          }
        }
      }
    }
  };

  constructor(private citaService: CitaService) {
    this.actualizarGrafica();
  }

  actualizarGrafica() {
    this.citaService.getCitas().subscribe(citas => {
      const agrupacion = this.agruparCitas(citas, this.agrupacion);

      this.chartLabels = agrupacion.labels;
      this.chartData = [{
        data: agrupacion.values,
        label: 'Citas'
      }];

      
      const maxCitas = agrupacion.values.length > 0 ? Math.max(...agrupacion.values, 6) : 6;
      const suggestedMax = Math.ceil(maxCitas / 6) * 6 + 10; 

      this.chartOptions = {
        ...this.chartOptions,
        scales: {
          ...this.chartOptions.scales,
          y: {
            ...this.chartOptions.scales?.['y'],
            suggestedMax,
            beginAtZero: true,
            title: { display: true, text: 'Número de citas' },
            ticks: {
              stepSize: 4,
              precision: 0,
              callback: function(value) {
                return Number(value);
              }
            }
          }
        }
      };
    });
  }

  agruparCitas(citas: Cita[], unidad: 'week' | 'month' | 'year'): { labels: string[], values: number[] } {
    const grupos: Record<string, number> = {};
    const weekInfo: Record<string, { year: number, week: number, monday: Date }> = {};

    for (const cita of citas) {
      let fecha: Date;
      if (typeof cita.fecha === 'string') {
        fecha = new Date(cita.fecha + 'T00:00:00');
      } else if (cita.fecha instanceof Date) {
        fecha = cita.fecha;
      } else if (typeof cita.fecha === 'object' && cita.fecha !== null && 'toDate' in cita.fecha) {
        fecha = (cita.fecha as Timestamp).toDate();
      } else {
        fecha = new Date(cita.fecha as any);
      }
      let clave: string;
      if (unidad === 'week') {
        const d = new Date(fecha);
        d.setHours(0, 0, 0, 0);
        const year = d.getFullYear();
        const week = this.getWeekNumber(d);
        const monday = this.getMondayOfWeek(year, week);
        clave = `S${week} (${this.formatDayMonth(monday)})`;
        weekInfo[clave] = { year, week, monday };
      } else if (unidad === 'month') {
        clave = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        clave = `${fecha.getFullYear()}`;
      }
      grupos[clave] = (grupos[clave] || 0) + 1;
    }

    const sorted = Object.entries(grupos).sort((a, b) => {
      if (unidad === 'week') {
        const infoA = weekInfo[a[0]];
        const infoB = weekInfo[b[0]];
        if (infoA.year !== infoB.year) return infoA.year - infoB.year;
        return infoA.week - infoB.week;
      }
      return a[0].localeCompare(b[0]);
    });

    const labels = sorted.map(([x]) => x);
    const values = sorted.map(([, y]) => y);

    return { labels, values };
  }

  getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
  }

  // Devuelve el lunes de la semana dada
  getMondayOfWeek(year: number, week: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const monday = new Date(simple);
    if (dow <= 4) {
      monday.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      monday.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return monday;
  }

  // Formatea un Date como DD-MM
  formatDayMonth(d: Date): string {
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}`;
  }
}
