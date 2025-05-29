import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaz para un trabajador
export interface Trabajador {
    id?: string;
    nombre: string;
    apellido: string;
    email: string;
    especialidad: 'enfermero' | 'enfermera' | 'medico' | 'medica' | 'administrador' | 'administradora';
}

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  constructor(private firestore: Firestore) {}

  // Obtener todos los trabajadores
  getTrabajadores(): Observable<Trabajador[]> {
    const trabajadoresRef = collection(this.firestore, 'trabajador');
    return from(getDocs(trabajadoresRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Trabajador)))
    );
  }

  // Obtener un trabajador por su ID
  getTrabajadorById(id: string): Observable<Trabajador | null> {
    const trabajadorDocRef = doc(this.firestore, `trabajador/${id}`);
    return from(getDoc(trabajadorDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as Trabajador;
        } else {
          return null;
        }
      })
    );
  }

  // Agregar un nuevo trabajador
  addTrabajador(trabajador: Trabajador): Observable<any> {
    const trabajadoresRef = collection(this.firestore, 'trabajador');
    return from(addDoc(trabajadoresRef, trabajador));
  }

  // Actualizar un trabajador existente
  updateTrabajador(trabajador: Trabajador): Observable<void> {
    const trabajadorDocRef = doc(this.firestore, `trabajador/${trabajador.id}`);
    const { id, ...trabajadorData } = trabajador;
    return from(updateDoc(trabajadorDocRef, { ...trabajadorData }));
  }

  // Eliminar un trabajador
  deleteTrabajador(trabajadorId: string): Observable<void> {
    const trabajadorDocRef = doc(this.firestore, `trabajador/${trabajadorId}`);
    return from(deleteDoc(trabajadorDocRef));
  }
}
