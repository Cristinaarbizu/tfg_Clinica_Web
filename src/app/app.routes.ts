import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PacienteComponent } from './paciente/paciente.component';
import { AgregarPacienteComponent } from './agregar-paciente/agregar-paciente.component';
import { EditarPacienteComponent } from './editar-paciente/editar-paciente.component';
import { LayoutComponent } from './layout/layout.component';
import { CitasComponent } from './citas/citas.component';
import { AgregarCitaComponent } from './agregar-cita/agregar-cita.component';
import { EditarCitaComponent } from './editar-cita/editar-cita.component';
import { TrabajadorComponent } from './trabajador/trabajador.component';
import { AgregarTrabajadorComponent } from './agregar-trabajador/agregar-trabajador.component';
import { EditarTrabajadorComponent } from './editar-trabajador/editar-trabajador.component';
import { GraficaComponent } from './grafica/grafica.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        children
            : [
                { path: 'dashboard', component: DashboardComponent },
                { path: 'paciente', component: PacienteComponent },
                { path: 'agregar-paciente', component: AgregarPacienteComponent },
                { path: 'editar-paciente/:id', component: EditarPacienteComponent },
                { path: 'citas', component: CitasComponent },
                { path: 'agregar-cita', component: AgregarCitaComponent },
                { path: 'editar-cita/:id', component: EditarCitaComponent },
                { path: 'trabajadores', component: TrabajadorComponent },
                { path: 'agregar-trabajador', component: AgregarTrabajadorComponent },
                { path: 'editar-trabajador/:id', component: EditarTrabajadorComponent },
                { path: 'graficas', component: GraficaComponent },
            ]
    }

];
