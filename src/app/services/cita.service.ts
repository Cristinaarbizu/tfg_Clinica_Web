import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore'; 

export interface Cita {
  id?: string;
  id_paciente: string;
  fecha: Date | Timestamp; 
  hora: string;
  motivo: string;
  estado: 'programada' | 'completada' | 'cancelada';
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  constructor(private firestore: Firestore) {}

  getCitas(): Observable<Cita[]> {
    const citasRef = collection(this.firestore, 'citas');
    return from(getDocs(citasRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Cita
      })))
    );
  }

  getCitaById(id: string): Observable<Cita | null> {
    const citaDocRef = doc(this.firestore, `citas/${id}`);
    return from(getDoc(citaDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data() as Cita
          };
        } else {
          return null;
        }
      })
    );
  }

  addCita(cita: Cita): Observable<any> {
    const citasRef = collection(this.firestore, 'citas');
    const citaConEstado = { ...cita, estado: 'programada' };
    return from(addDoc(citasRef, citaConEstado));
  }

  updateCita(cita: Cita): Observable<void> {
    const citaDocRef = doc(this.firestore, `citas/${cita.id}`);
    return from(updateDoc(citaDocRef, { ...cita }));
  }

  deleteCita(citaId: string): Observable<void> {
    const citaDocRef = doc(this.firestore, `citas/${citaId}`);
    return from(deleteDoc(citaDocRef));
  }

  actualizarEstadoCita(citaId: string, nuevoEstado: 'programada' | 'completada' | 'cancelada'): Observable<void> {
    const citaDocRef = doc(this.firestore, `citas/${citaId}`);
    return from(updateDoc(citaDocRef, { estado: nuevoEstado }));
  }
}
