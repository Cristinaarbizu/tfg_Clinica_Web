import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../services/auth.service'; // Importa el servicio de autenticación
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit {
  citasProgramadas$: Observable<number>;
  citasCompletadas$: Observable<number>;
  citasCanceladas$: Observable<number>;
  medicosEnfermerosDisponibles$: Observable<number>;
  totalPacientes$: Observable<number>;
  citasHoy$: Observable<number>;
  usuarioEmail = ''; 

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private auth: Auth 
  ) {
    this.citasProgramadas$ = this.dashboardService.getAppointmentsByStatus('programada');
    this.citasCompletadas$ = this.dashboardService.getAppointmentsByStatus('completada');
    this.citasCanceladas$ = this.dashboardService.getAppointmentsByStatus('cancelada');
    this.medicosEnfermerosDisponibles$ = this.dashboardService.getAvailableWorkers();
    this.totalPacientes$ = this.dashboardService.getTotalPatients();
    this.citasHoy$ = this.dashboardService.getTodayAppointments();
  }

  ngOnInit(): void {
    this.obtenerUsuarioEmail();
  }

  obtenerUsuarioEmail(): void {
    const usuarioActual = this.auth.currentUser;
    if (usuarioActual) {
      this.usuarioEmail = usuarioActual.email || 'Usuario desconocido'; 
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
