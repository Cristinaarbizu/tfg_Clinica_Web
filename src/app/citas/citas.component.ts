import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CitaService, Cita } from '../services/cita.service';
import { PacienteService, Paciente } from '../services/paciente.service';
import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class CitasComponent implements OnInit {
  private refreshCitas$ = new Subject<void>();
  citas$: Observable<Cita[]>;
  pacientes$: Observable<Paciente[]>;
  citasConNombrePaciente$: Observable<any[]>;

  // Para buscador y filtros
  searchTerm: string = '';
  private searchTerms$ = new BehaviorSubject<string>('');

  fechaDesde: string = '';
  fechaHasta: string = '';
  private fechasFiltro$ = new BehaviorSubject<{ desde: string, hasta: string }>({ desde: '', hasta: '' });

  constructor(
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private http: HttpClient
  ) {
    this.citas$ = this.refreshCitas$.pipe(
      startWith(undefined),
      switchMap(() => this.citaService.getCitas())
    );

    this.pacientes$ = this.pacienteService.getPacientes();

    this.citasConNombrePaciente$ = combineLatest([
      this.citas$,
      this.pacientes$,
      this.searchTerms$,
      this.fechasFiltro$
    ]).pipe(
      map(([citas, pacientes, term, fechasFiltro]) => {
        const lowerTerm = (term || '').toLowerCase();
        const desde = fechasFiltro.desde ? new Date(fechasFiltro.desde) : null;
        const hasta = fechasFiltro.hasta ? new Date(fechasFiltro.hasta) : null;

        return citas
          .map(cita => {
            const paciente = pacientes.find(p => p.id === cita.id_paciente);
            let fecha = cita.fecha;
            if (fecha && typeof (fecha as any).toDate === 'function') {
              fecha = (fecha as any).toDate();
            } else if (fecha && (fecha as any).seconds) {
              fecha = new Date((fecha as any).seconds * 1000);
            }
            return {
              ...cita,
              fecha,
              nombrePaciente: paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado',
              telefonoPaciente: paciente ? paciente.telefono : ''
            };
          })
          .filter(cita => {
            // Filtro por texto
            const textoOk =
              cita.nombrePaciente.toLowerCase().includes(lowerTerm) ||
              cita.motivo.toLowerCase().includes(lowerTerm) ||
              cita.estado.toLowerCase().includes(lowerTerm);

            // Filtro por fechas
            let fechaOk = true;
            if (desde && cita.fecha) {
              fechaOk = fechaOk && (cita.fecha >= desde);
            }
            if (hasta && cita.fecha) {
              const hastaFin = new Date(hasta);
              hastaFin.setHours(23, 59, 59, 999);
              fechaOk = fechaOk && (cita.fecha <= hastaFin);
            }
            return textoOk && fechaOk;
          });
      })
    );
  }

  ngOnInit(): void {
    this.refreshCitas$.next();
  }

  // Buscador de texto
  onSearchTermChange() {
    this.searchTerms$.next(this.searchTerm);
  }

  // Filtro de fechas
  onFechaChange() {
    this.fechasFiltro$.next({ desde: this.fechaDesde, hasta: this.fechaHasta });
  }

  // Eliminar cita
  eliminarCita(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      this.citaService.deleteCita(id).subscribe(() => {
        this.refreshCitas$.next();
      });
    }
  }

  // Cambiar estado de cita
  actualizarEstadoCita(citaId: string, nuevoEstado: 'programada' | 'completada' | 'cancelada') {
    this.citaService.actualizarEstadoCita(citaId, nuevoEstado).subscribe(() => {
      this.refreshCitas$.next();
    });
  }

  // Saber si una cita es futura
  esCitaFutura(fecha: Date | any): boolean {
    if (fecha && typeof fecha.toDate === 'function') {
      fecha = fecha.toDate();
    }
    if (fecha instanceof Date) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaCita = new Date(fecha);
      fechaCita.setHours(0, 0, 0, 0);
      return fechaCita >= hoy;
    }
    return false;
  }

  // Enviar confirmación por WhatsApp
  enviarWhatsAppConfirmacion(cita: any) {
    const telefono = cita.telefonoPaciente.startsWith('+')
      ? cita.telefonoPaciente
      : '+34' + cita.telefonoPaciente; 

    const contentSid = 'HX768fe02747d069a6e9df5193dd265712'; 
    const variables = {
      "1": cita.nombrePaciente,
      "2": this.formatearFecha(cita.fecha),
      "3": cita.hora
    };

    this.http.post('http://localhost:3000/api/enviar-whatsapp', {
      telefono,
      contentSid,
      variables
    }).subscribe({
      next: () => alert('Mensaje de confirmación enviado por WhatsApp'),
      error: () => alert('Error al enviar mensaje')
    });
  }

  // Formatear fecha para el mensaje
  private formatearFecha(fecha: Date | any): string {
    if (fecha && typeof fecha.toDate === 'function') {
      fecha = fecha.toDate();
    }
    return fecha instanceof Date
      ? fecha.toLocaleDateString('es-MX')
      : fecha;
  }
}
