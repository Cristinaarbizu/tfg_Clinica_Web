import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private firestore: Firestore) {}

  getTotalPatients(): Observable<number> {
    const patientsRef = collection(this.firestore, 'pacientes');
    return from(getDocs(patientsRef)).pipe(
      map(snapshot => snapshot.size)
    );
  }

  getTodayAppointments(): Observable<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentsRef = collection(this.firestore, 'citas');
  const q = query(
    appointmentsRef, 
    where('fecha', '>=', today),
    where('fecha', '<', new Date(today.getTime() + 86400000))
  );
  return from(getDocs(q)).pipe(
    map(snapshot => snapshot.size)
  );
}


  getAppointmentsByStatus(status: string): Observable<number> {
    const appointmentsRef = collection(this.firestore, 'citas');
    const q = query(appointmentsRef, where('estado', '==', status));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.size)
    );
  }


  getAvailableWorkers(): Observable<number> {
    const workersRef = collection(this.firestore, 'trabajador');
    const q = query(
      workersRef,
      where('especialidad', 'in', ['medico', 'medica', 'enfermero', 'enfermera'])
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.size)
    );
  }

  getRecentActivities(): Observable<any[]> {
    const activitiesRef = collection(this.firestore, 'actividades');
    const q = query(activitiesRef, orderBy('fecha', 'desc'), limit(5));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })))
    );
  }
}
