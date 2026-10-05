import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models/expense';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatTableModule, MatSnackBarModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private api = inject(DashboardService);
  private snack = inject(MatSnackBar);

  datos = signal<Dashboard | null>(null);
  desde = signal('');
  hasta = signal('');
  cargando = signal(false);
  colTop = ['nombre', 'cantidad', 'total'];

  fmt = (v: number) => this.api.formatoCLP(v);

  // altura max para barras simples (ventas vs gastos por dia)
  maxDia = computed(() => {
    const d = this.datos()?.por_dia || [];
    return Math.max(1, ...d.map(x => Math.max(x.ventas, x.gastos)));
  });

  constructor() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.api.obtener(this.desde(), this.hasta()).subscribe({
      next: (d) => {
        this.cargando.set(false);
        this.datos.set(d);
        if (!this.desde() && !this.hasta()) {
          this.desde.set(d.desde);
          this.hasta.set(d.hasta);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.snack.open('No se pudo conectar con Flask :5000', 'OK', { duration: 3000 });
      },
    });
  }

  ultimos7() {
    const hoy = new Date();
    const h = new Date(hoy);
    h.setDate(hoy.getDate() - 6);
    this.desde.set(h.toISOString().slice(0, 10));
    this.hasta.set(hoy.toISOString().slice(0, 10));
    this.cargar();
  }

  esteMes() {
    const hoy = new Date();
    const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.desde.set(primero.toISOString().slice(0, 10));
    this.hasta.set(hoy.toISOString().slice(0, 10));
    this.cargar();
  }

  barra(valor: number): string {
    return `${Math.round((valor / this.maxDia()) * 100)}%`;
  }
}
