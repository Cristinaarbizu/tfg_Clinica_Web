import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaService, Cita } from '../services/cita.service';
import { PacienteService, Paciente } from '../services/paciente.service';
import { TrabajadorService, Trabajador } from '../services/trabajador.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-editar-cita',
  templateUrl: './editar-cita.component.html',
  styleUrls: ['./editar-cita.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditarCitaComponent implements OnInit {
  citaId: string = '';
  cita: Cita = {
    id_paciente: '',
    fecha: new Date(),
    hora: '',
    motivo: '',
    estado: 'programada'
  };
  fechaFormateada: string = '';
  pacientes$: Observable<Paciente[]>;
  trabajadores$: Observable<Trabajador[]>;
  medicoAsignado: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private trabajadorService: TrabajadorService
  ) {
    this.pacientes$ = this.pacienteService.getPacientes();
    this.trabajadores$ = this.trabajadorService.getTrabajadores();
  }

  ngOnInit(): void {
    this.citaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.citaId) {
      this.cargarCita();
    }
  }

  cargarCita() {
    this.citaService.getCitaById(this.citaId).subscribe(
      (citaCargada) => {
        if (citaCargada) {
          // Convierte fecha a Date si es Timestamp
          let fecha: Date;
          if (citaCargada.fecha instanceof Date) {
            fecha = citaCargada.fecha;
          } else if ('toDate' in citaCargada.fecha) {
            fecha = (citaCargada.fecha as Timestamp).toDate();
          } else {
            fecha = new Date(citaCargada.fecha as any);
          }
          this.cita = { ...citaCargada, fecha };
          this.fechaFormateada = this.formatearFecha(fecha);
          this.cargarMedicoAsignado();
        } else {
          console.error('No se encontró la cita');
        }
      },
      (error) => {
        console.error('Error al cargar la cita', error);
      }
    );
  }

  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  cargarMedicoAsignado() {
    if (this.cita.id_paciente) {
      this.pacienteService.getPacienteById(this.cita.id_paciente).subscribe(
        (paciente) => {
          if (paciente && paciente.id_trabajador) {
            this.trabajadorService.getTrabajadorById(paciente.id_trabajador).subscribe(
              (trabajador) => {
                this.medicoAsignado = trabajador ? `${trabajador.nombre} ${trabajador.apellido}` : 'No asignado';
              },
              (error) => console.error('Error al cargar el trabajador', error)
            );
          }
        },
        (error) => console.error('Error al cargar el paciente', error)
      );
    }
  }

  actualizarCita() {
    if (this.cita) {
      let fecha = new Date(this.fechaFormateada);
      if (this.cita.hora) {
        const [hours, minutes] = this.cita.hora.split(':').map(Number);
        fecha.setHours(hours, minutes, 0, 0);
      }
      // Convierte a Timestamp
      const fechaTimestamp = Timestamp.fromDate(fecha);

      const citaParaActualizar: Cita = {
        ...this.cita,
        fecha: fechaTimestamp
      };

      this.citaService.updateCita(citaParaActualizar).subscribe(
        () => {
          alert('Cita actualizada con éxito');
          this.router.navigate(['/citas']);
        },
        (error) => {
          console.error('Error al actualizar la cita', error);
          alert('Error al actualizar la cita');
        }
      );
    }
  }

  cancelar() {
    this.router.navigate(['/citas']);
  }
}
