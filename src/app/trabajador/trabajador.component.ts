import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrabajadorService, Trabajador } from '../services/trabajador.service';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trabajador',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './trabajador.component.html',
  styleUrls: ['./trabajador.component.scss']
})
export class TrabajadorComponent implements OnInit {
  trabajadores$: Observable<Trabajador[]>;
  searchTerm: string = '';
  searchTerms$ = new BehaviorSubject<string>('');
  filteredTrabajadores$: Observable<Trabajador[]>;

  constructor(
    private trabajadorService: TrabajadorService,
    private router: Router
  ) {
    // Recarga los trabajadores cada vez que se realiza una acción
    this.trabajadores$ = this.searchTerms$.pipe(
      startWith(''),
      switchMap(() => this.trabajadorService.getTrabajadores())
    );

    this.filteredTrabajadores$ = this.trabajadores$.pipe(
      map(trabajadores =>
        trabajadores.filter(trabajador =>
          trabajador.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          trabajador.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          trabajador.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          trabajador.especialidad.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
    );
  }

  ngOnInit(): void {}

  eliminarTrabajador(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este trabajador?')) {
      this.trabajadorService.deleteTrabajador(id).subscribe(() => {
        console.log('Trabajador eliminado');
        this.searchTerms$.next(this.searchTerm);
      });
    }
  }

  editarTrabajador(trabajador: Trabajador) {
  this.router.navigate(['/editar-trabajador', trabajador.id]);
}

  onSearchTermChange() {
    this.searchTerms$.next(this.searchTerm);
  }
}
