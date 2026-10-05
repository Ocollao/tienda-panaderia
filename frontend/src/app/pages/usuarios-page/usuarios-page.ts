import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { AppUser } from '../../core/models/user';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.scss',
})
export class UsuariosPage {
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  usuarios = signal<AppUser[]>([]);
  columnas = ['username', 'rol', 'activo', 'acciones'];
  nuevoUser = signal('');
  nuevaClave = signal('');
  nuevoRol = signal('vendedor');

  constructor() { this.cargar(); }

  cargar() {
    this.auth.listar().subscribe({
      next: (d) => this.usuarios.set(d),
      error: () => this.snack.open('No se pudo conectar con Flask :5000', 'OK', { duration: 3000 }),
    });
  }

  crear() {
    if (!this.nuevoUser().trim() || !this.nuevaClave()) {
      this.snack.open('Ponle nombre y clave al usuario', 'OK', { duration: 2500 });
      return;
    }
    this.auth.registrar(this.nuevoUser().trim(), this.nuevaClave(), this.nuevoRol()).subscribe({
      next: () => {
        this.snack.open('Usuario creado, bacán ✓', 'OK', { duration: 2000 });
        this.nuevoUser.set(''); this.nuevaClave.set(''); this.nuevoRol.set('vendedor');
        this.cargar();
      },
      error: (e) => this.snack.open(e.error?.error || 'No se pudo crear', 'OK', { duration: 3500 }),
    });
  }

  cambiarRol(u: AppUser, rol: string) {
    this.auth.actualizar(u.id, { rol: rol as AppUser['rol'] }).subscribe({
      next: () => { this.snack.open('Rol actualizado', 'OK', { duration: 2000 }); this.cargar(); },
      error: (e) => this.snack.open(e.error?.error || 'Error', 'OK', { duration: 3000 }),
    });
  }

  toggleActivo(u: AppUser) {
    this.auth.actualizar(u.id, { activo: !u.activo }).subscribe({
      next: () => { this.cargar(); },
      error: (e) => this.snack.open(e.error?.error || 'Error', 'OK', { duration: 3000 }),
    });
  }
}
