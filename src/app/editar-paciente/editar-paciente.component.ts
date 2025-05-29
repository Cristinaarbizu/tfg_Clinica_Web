import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PacienteService, Paciente } from '../services/paciente.service';
import { TrabajadorService, Trabajador } from '../services/trabajador.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-editar-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-paciente.component.html',
  styleUrls: ['./editar-paciente.component.scss']
})
export class EditarPacienteComponent implements OnInit {
  paciente!: Paciente;
  trabajadores$: Observable<Trabajador[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private trabajadorService: TrabajadorService
  ) {
    this.trabajadores$ = this.trabajadorService.getTrabajadores();
  }

  ngOnInit() {
    const state = history.state;
    if (state && state.paciente) {
      this.paciente = state.paciente;
    } else {
      console.error('No se encontraron datos del paciente.');
      this.router.navigate(['/paciente']);
    }
  }

  guardarCambios() {
    this.pacienteService.updatePaciente(this.paciente).subscribe(() => {
      console.log('Paciente actualizado');
      this.router.navigate(['/paciente']);
    });
  }

  cancelar() {
    this.router.navigate(['/paciente']);
  }
}
