import { Component, OnInit } from '@angular/core';
import { CitaService, Cita } from '../services/cita.service';
import { PacienteService, Paciente } from '../services/paciente.service';
import { TrabajadorService, Trabajador } from '../services/trabajador.service';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-agregar-cita',
  templateUrl: './agregar-cita.component.html',
  styleUrls: ['./agregar-cita.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AgregarCitaComponent implements OnInit {
  nuevaCita: Cita = {
    id_paciente: '',
    fecha: new Date(),
    hora: '',
    motivo: '',
    estado: 'programada'
  };
  pacientes$: Observable<Paciente[]>;
  trabajadores$: Observable<Trabajador[]>;
  medicoAsignado: string = '';
  pacienteSeleccionado: Paciente | null = null;
  mostrarFormularioPaciente: boolean = false;
  nuevoPaciente: Paciente = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    id_trabajador: ''
  };

  searchTerm$ = new Subject<string>();
  resultadosBusqueda$: Observable<Paciente[]>;

  // NUEVO: variable para el valor del input de paciente
  pacienteInputValue: string = '';

  constructor(
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private trabajadorService: TrabajadorService,
    private router: Router
  ) {
    this.pacientes$ = this.pacienteService.getPacientes();
    this.trabajadores$ = this.trabajadorService.getTrabajadores();
    this.resultadosBusqueda$ = this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.buscarPacientes(term))
    );
  }

  ngOnInit(): void {}

  buscarPacientes(term: string): Observable<Paciente[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.pacientes$.pipe(
      map(pacientes => pacientes.filter(paciente =>
        paciente.nombre.toLowerCase().includes(term.toLowerCase()) ||
        paciente.apellido.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }

  onPacienteSeleccionado(paciente: Paciente) {
    this.pacienteSeleccionado = paciente;
    this.nuevaCita.id_paciente = paciente.id!;
    this.pacienteInputValue = `${paciente.nombre} ${paciente.apellido}`; 
    this.mostrarFormularioPaciente = false;
    if (paciente && paciente.id_trabajador) {
      this.trabajadorService.getTrabajadorById(paciente.id_trabajador).subscribe(trabajador => {
        this.medicoAsignado = trabajador ? `${trabajador.nombre} ${trabajador.apellido}` : 'No asignado';
      });
    } else {
      this.medicoAsignado = 'No asignado';
    }
  }

  mostrarFormularioAgregarPaciente() {
    this.mostrarFormularioPaciente = true;
    this.pacienteInputValue = '';
    this.pacienteSeleccionado = null;
  }

  agregarPaciente() {
    this.pacienteService.addPaciente(this.nuevoPaciente).subscribe(pacienteAgregado => {
      this.nuevaCita.id_paciente = pacienteAgregado.id!;
      this.mostrarFormularioPaciente = false;
      this.pacienteSeleccionado = pacienteAgregado;
      this.pacienteInputValue = `${pacienteAgregado.nombre} ${pacienteAgregado.apellido}`; 
      this.pacientes$ = this.pacienteService.getPacientes();
      this.actualizarMedicoAsignado(pacienteAgregado.id_trabajador);
      alert('Paciente agregado exitosamente.');
    });
  }

  actualizarMedicoAsignado(idTrabajador: string) {
    if (idTrabajador) {
      this.trabajadorService.getTrabajadorById(idTrabajador).subscribe(trabajador => {
        this.medicoAsignado = trabajador ? `${trabajador.nombre} ${trabajador.apellido}` : 'No asignado';
      });
    } else {
      this.medicoAsignado = 'No asignado';
    }
  }

  cancelarAgregarPaciente() {
    this.mostrarFormularioPaciente = false;
    this.nuevoPaciente = {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      id_trabajador: ''
    };
    this.pacienteInputValue = '';
    this.pacienteSeleccionado = null;
  }

  agregarCita() {
    if (this.pacienteSeleccionado) {
      this.nuevaCita.id_paciente = this.pacienteSeleccionado.id!;

      let fecha: Date;
      if (typeof this.nuevaCita.fecha === 'string') {
        fecha = new Date(this.nuevaCita.fecha + 'T00:00:00');
      } else if (this.nuevaCita.fecha instanceof Date) {
        fecha = this.nuevaCita.fecha;
      } else if (typeof this.nuevaCita.fecha === 'object' && this.nuevaCita.fecha !== null && 'toDate' in this.nuevaCita.fecha) {
        fecha = (this.nuevaCita.fecha as Timestamp).toDate();
      } else {
        fecha = new Date(this.nuevaCita.fecha as any);
      }

      if (this.nuevaCita.hora) {
        const [hours, minutes] = this.nuevaCita.hora.split(':').map(Number);
        fecha.setHours(hours, minutes, 0, 0);
      }

      const fechaTimestamp = Timestamp.fromDate(fecha);

      const citaParaGuardar: Cita = {
        ...this.nuevaCita,
        fecha: fechaTimestamp
      };

      this.citaService.addCita(citaParaGuardar).subscribe({
        next: () => {
          alert('Cita agregada con éxito.');
          this.router.navigate(['/citas']);
        },
        error: (err) => {
          console.error('Error al guardar la cita:', err);
          alert('Error al guardar la cita');
        }
      });
    } else {
      alert('Por favor, seleccione un paciente o agregue uno nuevo antes de crear la cita.');
    }
  }

  cancelar() {
    this.router.navigate(['/citas']);
  }
}
