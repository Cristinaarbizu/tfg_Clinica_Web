import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService, Paciente } from '../services/paciente.service';
import { TrabajadorService, Trabajador } from '../services/trabajador.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-agregar-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-paciente.component.html',
  styleUrls: ['./agregar-paciente.component.scss']
})
export class AgregarPacienteComponent implements OnInit {
  nuevoPaciente: Paciente = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    id_trabajador: ''
  };
  trabajadores$: Observable<Trabajador[]>;

  constructor(
    private pacienteService: PacienteService,
    private trabajadorService: TrabajadorService,
    private router: Router
  ) {
    this.trabajadores$ = this.trabajadorService.getTrabajadores();
  }

  ngOnInit() {}

  agregarPaciente() {
    this.pacienteService.addPaciente(this.nuevoPaciente).subscribe(() => {
      this.router.navigate(['/paciente']);
    });
  }

  cancelar() {
    this.router.navigate(['/paciente']); 
  }
}
