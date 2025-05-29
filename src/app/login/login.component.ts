import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  // Recuperación de contraseña
  showResetPassword = false;
  resetEmail = '';
  resetLoading = false;
  resetMessage = '';
  resetError = '';

  // Registro
  showRegistration = false;
  registro = {
    nombre: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  async onResetPassword() {
    if (!this.resetEmail) {
      this.resetError = 'Introduce tu correo electrónico.';
      return;
    }
    this.resetLoading = true;
    this.resetError = '';
    this.resetMessage = '';
    try {
      await this.authService.sendPasswordResetEmail(this.resetEmail);
      this.resetMessage = 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';
    } catch (error: any) {
      this.resetError = 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';
    } finally {
      this.resetLoading = false;
    }
  }

  async onRegister() {
    if (!this.validateRegisterForm()) return;

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(
        this.registro.nombre,
        '', 
        '', 
        this.registro.email,
        this.registro.password
      );
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  private validateForm(): boolean {
    if (!this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return false;
    }
    return true;
  }

  private validateRegisterForm(): boolean {
    if (!this.registro.nombre || !this.registro.email || !this.registro.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return false;
    }
    return true;
  }

  private handleError(error: Error): void {
    this.errorMessage = error.message;
    console.error('Error detallado:', error.message);
  }
}
