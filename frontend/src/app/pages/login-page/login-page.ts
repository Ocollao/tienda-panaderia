import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSnackBarModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  username = signal('dueno');
  password = signal('dueno123');
  entrando = signal(false);

  entrar() {
    if (!this.username().trim() || !this.password()) {
      this.snack.open('Escribe tu usuario y clave, po', 'OK', { duration: 2500 });
      return;
    }
    this.entrando.set(true);
    this.auth.login(this.username().trim(), this.password()).subscribe({
      next: (r) => {
        this.entrando.set(false);
        this.snack.open(`Hola ${r.user.username} (${r.user.rol}) 👋`, 'OK', { duration: 2500 });
        this.router.navigateByUrl(r.user.rol === 'dueno' ? '/dashboard' : '/ventas');
      },
      error: (e) => {
        this.entrando.set(false);
        this.snack.open(e.error?.error || 'No se pudo entrar', 'OK', { duration: 3500 });
      },
    });
  }
}
