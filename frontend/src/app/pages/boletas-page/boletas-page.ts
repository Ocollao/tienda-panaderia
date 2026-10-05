import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesService } from '../../core/services/sales.service';
import { Sale, Resumen } from '../../core/models/sale';
import { BoletaDetailDialog } from './boleta-detail-dialog';

@Component({
  selector: 'app-boletas-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './boletas-page.html',
  styleUrl: './boletas-page.scss',
})
export class BoletasPage {
  private api = inject(SalesService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  boletas = signal<Sale[]>([]);
  resumen = signal<Resumen | null>(null);
  desde = signal('');
  hasta = signal('');
  columnas = ['folio', 'fecha', 'items', 'medio', 'total', 'ver'];

  fmt = (v: number) => this.api.formatoCLP(v);
  fecha = (iso: string) => this.api.formatoFecha(iso);

  constructor() { this.cargar(); }

  cargar() {
    this.api.listar(this.desde(), this.hasta()).subscribe({
      next: (d) => this.boletas.set(d),
      error: () => this.snack.open('No se pudo conectar con Flask :5000', 'OK', { duration: 3000 }),
    });
    this.api.resumen(this.desde(), this.hasta()).subscribe({ next: (r) => this.resumen.set(r) });
  }

  ver(b: Sale) {
    this.api.detalle(b.id).subscribe({
      next: (full) => this.dialog.open(BoletaDetailDialog, { width: '440px', data: full }),
      error: () => this.snack.open('No se pudo abrir la boleta', 'OK', { duration: 2000 }),
    });
  }

  limpiarFiltros() {
    this.desde.set('');
    this.hasta.set('');
    this.cargar();
  }
}
