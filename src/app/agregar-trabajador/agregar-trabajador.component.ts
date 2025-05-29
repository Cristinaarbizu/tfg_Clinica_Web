import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TrabajadorService } from '../services/trabajador.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-agregar-trabajador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './agregar-trabajador.component.html',
  styleUrls: ['./agregar-trabajador.component.scss']
})
export class AgregarTrabajadorComponent {
  trabajadorForm: FormGroup;
  especialidades = [
    { value: 'medico', label: 'Médico' },
    { value: 'medica', label: 'Médica' },
    { value: 'enfermero', label: 'Enfermero' },
    { value: 'enfermera', label: 'Enfermera' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'administradora', label: 'Administradora' },
  ];
  enviado = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private trabajadorService: TrabajadorService,
    private router: Router
  ) {
    this.trabajadorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      apellido: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      especialidad: ['', Validators.required]
    });
  }

  get f() {
    return this.trabajadorForm.controls;
  }

  onSubmit() {
    this.enviado = true;
    this.errorMsg = '';

    if (this.trabajadorForm.invalid) {
      return;
    }

    this.trabajadorService.addTrabajador(this.trabajadorForm.value).subscribe({
      next: () => {
        this.trabajadorForm.reset();
        this.enviado = false;
        this.router.navigate(['/trabajadores']);
      },
      error: (err) => {
        this.errorMsg = 'Error al agregar trabajador. Intenta de nuevo.';
        this.enviado = false;
      }
    });
  }
}
