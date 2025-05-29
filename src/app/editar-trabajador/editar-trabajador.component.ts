import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrabajadorService, Trabajador } from '../services/trabajador.service';

@Component({
  selector: 'app-editar-trabajador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './editar-trabajador.component.html',
  styleUrls: ['./editar-trabajador.component.scss']
})
export class EditarTrabajadorComponent implements OnInit {
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
  trabajadorId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    this.trabajadorId = this.route.snapshot.paramMap.get('id');
    if (this.trabajadorId) {
      this.trabajadorService.getTrabajadorById(this.trabajadorId).subscribe({
        next: (trabajador) => {
          if (trabajador) {
            this.trabajadorForm.patchValue({
              nombre: trabajador.nombre,
              apellido: trabajador.apellido,
              email: trabajador.email,
              especialidad: trabajador.especialidad
            });
          } else {
            this.errorMsg = 'Trabajador no encontrado.';
          }
        },
        error: () => {
          this.errorMsg = 'Error al cargar los datos del trabajador.';
        }
      });
    }
  }

  get f() {
    return this.trabajadorForm.controls;
  }

  onSubmit() {
    this.enviado = true;
    this.errorMsg = '';

    if (this.trabajadorForm.invalid || !this.trabajadorId) {
      return;
    }

    const trabajadorActualizado: Trabajador = {
      id: this.trabajadorId,
      ...this.trabajadorForm.value
    };

    this.trabajadorService.updateTrabajador(trabajadorActualizado).subscribe({
      next: () => {
        this.trabajadorForm.reset();
        this.enviado = false;
        this.router.navigate(['/trabajadores']);
      },
      error: () => {
        this.errorMsg = 'Error al actualizar trabajador. Intenta de nuevo.';
        this.enviado = false;
      }
    });
  }
}
