import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaz para un paciente
export interface Paciente {
    id?: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    direccion: string;
    id_trabajador?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  constructor(private firestore: Firestore) {}

  // Obtener todos los pacientes
  getPacientes(): Observable<Paciente[]> {
    const pacientesRef = collection(this.firestore, 'pacientes');
    return from(getDocs(pacientesRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Paciente)))
    );
  }

  // Obtener un paciente por su ID
  getPacienteById(id: string): Observable<Paciente | null> {
    const pacienteDocRef = doc(this.firestore, `pacientes/${id}`);
    return from(getDoc(pacienteDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as Paciente;
        } else {
          return null;
        }
      })
    );
  }

  // Agregar un nuevo paciente
  addPaciente(paciente: Paciente): Observable<any> {
    const pacientesRef = collection(this.firestore, 'pacientes');
    return from(addDoc(pacientesRef, paciente));
  }

  // Actualizar un paciente existente
  updatePaciente(paciente: Paciente): Observable<void> {
    const pacienteDocRef = doc(this.firestore, `pacientes/${paciente.id}`);
    return from(updateDoc(pacienteDocRef, { ...paciente }));
  }

  // Eliminar un paciente
  deletePaciente(pacienteId: string): Observable<void> {
    const pacienteDocRef = doc(this.firestore, `pacientes/${pacienteId}`);
    return from(deleteDoc(pacienteDocRef));
  }
}
