import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, collection, query, where, getDocs, Timestamp } from '@angular/fire/firestore';
import { Auth, authState, UserCredential, signInWithEmailAndPassword, signOut, updateProfile, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

interface Usuario {
  nombre: string;
  email: string;
  apellidos?: string;
  fechaNacimiento?: Timestamp;
  rol?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<Usuario | null>(null);
  user$ = this.userSubject.asObservable();

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  constructor() {
    authState(this.auth).subscribe(async (user) => {
      if (user) {
        const userData = await this.getUserDataByEmail(user.email!);
        this.userSubject.next(userData);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const userData = await this.getUserDataByEmail(email);

      if (!userData) throw new Error('No se encontraron datos adicionales en Firestore');

      localStorage.setItem('usuarioNombre', userData.nombre);
      this.userSubject.next(userData);
      this.router.navigate(['/dashboard']);
      return credential;
    } catch (error: any) {
      throw this.mapAuthError(error.code || error.message);
    }
  }

  async register(nombre: string, apellidos: string, fechaNacimiento: string, email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      const userRef = doc(this.firestore, `usuario/${user.uid}`);
      await setDoc(userRef, {
        nombre,
        email,
        rol: 'usuario',
        fechaRegistro: Timestamp.now()
      });

      await updateProfile(user, { displayName: nombre });
      localStorage.setItem('usuarioNombre', nombre);
      this.userSubject.next({ nombre, email });
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      throw this.mapAuthError(error.code || error.message);
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);

      const user = credential.user;
      if (!user.email) throw new Error('El usuario de Google no tiene un correo asociado');

      let userData = await this.getUserDataByEmail(user.email);

      if (!userData) {
        const userRef = doc(this.firestore, `usuario/${user.uid}`);
        await setDoc(userRef, {
          nombre: user.displayName || 'Sin nombre',
          email: user.email,
          rol: 'usuario',
          fechaRegistro: Timestamp.now()
        });
        userData = { nombre: user.displayName || 'Sin nombre', email: user.email };
      }

      this.userSubject.next(userData);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      throw this.mapAuthError(error.code || error.message);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      // mensaje genérico
      throw new Error('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
    }
  }

  private async getUserDataByEmail(email: string): Promise<Usuario | null> {
    try {
      const q = query(collection(this.firestore, 'usuario'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const userData = querySnapshot.docs[0].data();
      return {
        nombre: userData['nombre'] || '',
        email: userData['email'] || '',
        apellidos: userData['apellidos'],
        fechaNacimiento: userData['fechaNacimiento'],
        rol: userData['rol']
      };
    } catch (error) {
      return null;
    }
  }

  private mapAuthError(code: string): Error {
    const errorMap: { [key: string]: string } = {
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Método no habilitado',
      'auth/weak-password': 'Contraseña débil',
      'auth/user-not-found': 'Usuario no registrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/popup-closed-by-user': 'Proceso cancelado por el usuario',
      'auth/network-request-failed': 'Error de conexión',
    };
    return new Error(errorMap[code] || 'Error desconocido');
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
