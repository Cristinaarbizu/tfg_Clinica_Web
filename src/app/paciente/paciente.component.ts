import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PacienteService, Paciente } from '../services/paciente.service';
import { TrabajadorService, Trabajador } from '../services/trabajador.service';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.scss']
})
export class PacienteComponent implements OnInit {
  pacientes$: Observable<Paciente[]>;
  trabajadores$: Observable<Trabajador[]>;
  searchTerm: string = '';
  searchTerms$ = new BehaviorSubject<string>('');
  filteredPacientes$: Observable<(Paciente & { trabajadorInfo?: string })[]>;

  constructor(
    private pacienteService: PacienteService,
    private trabajadorService: TrabajadorService,
    private router: Router
  ) {
    this.trabajadores$ = this.trabajadorService.getTrabajadores();

    // Recarga los pacientes cada vez que se realiza una acción
    this.pacientes$ = this.searchTerms$.pipe(
      startWith(''),
      switchMap(() => this.pacienteService.getPacientes())
    );

    this.filteredPacientes$ = combineLatest([
      this.pacientes$,
      this.trabajadores$,
      this.searchTerms$
    ]).pipe(
      map(([pacientes, trabajadores, term]) =>
        pacientes
          .filter(paciente =>
            paciente.nombre.toLowerCase().includes(term.toLowerCase()) ||
            paciente.apellido.toLowerCase().includes(term.toLowerCase()) ||
            paciente.email.toLowerCase().includes(term.toLowerCase())
          )
          .map(paciente => ({
            ...paciente,
            trabajadorInfo: this.getTrabajadorInfo(paciente.id_trabajador, trabajadores)
          }))
      )
    );
  }

  ngOnInit(): void {}

  private getTrabajadorInfo(id_trabajador: string | undefined, trabajadores: Trabajador[]): string {
    if (!id_trabajador) return 'No asignado';
    const trabajador = trabajadores.find(t => t.id === id_trabajador);
    return trabajador ? `${trabajador.nombre} ${trabajador.apellido} (${trabajador.especialidad})` : 'No asignado';
  }

  eliminarPaciente(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      this.pacienteService.deletePaciente(id).subscribe(() => {
        console.log('Paciente eliminado');
        this.searchTerms$.next(this.searchTerm);
      });
    }
  }

  editarPaciente(paciente: Paciente) {
    this.router.navigate(['/editar-paciente', paciente.id], { state: { paciente } });
  }

  onSearchTermChange() {
    this.searchTerms$.next(this.searchTerm);
  }
}
