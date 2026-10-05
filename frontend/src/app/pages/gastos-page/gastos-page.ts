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
import { MatDividerModule } from '@angular/material/divider';
import { ExpensesService } from '../../core/services/expenses.service';
import { Expense, GASTO_CATEGORIAS } from '../../core/models/expense';

@Component({
  selector: 'app-gastos-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule, MatDividerModule],
  templateUrl: './gastos-page.html',
  styleUrl: './gastos-page.scss',
})
export class GastosPage {
  private api = inject(ExpensesService);
  private snack = inject(MatSnackBar);

  gastos = signal<Expense[]>([]);
  resumen = signal<{ total: number; n_gastos: number; ticket_promedio: number; por_categoria: { categoria: string; total: number; n: number }[] } | null>(null);

  desde = signal('');
  hasta = signal('');
  categoriaFiltro = signal('');
  categorias = GASTO_CATEGORIAS;
  columnas = ['fecha', 'concepto', 'categoria', 'monto', 'acciones'];

  // formulario
  editId = signal<number | null>(null);
  concepto = signal('');
  categoria = signal<string>('insumos');
  monto = signal<number | null>(null);
  fecha = signal('');
  responsable = signal('');
  nota = signal('');
  guardando = signal(false);

  fmt = (v: number) => this.api.formatoCLP(v);
  ffecha = (iso: string) => this.api.formatoFecha(iso);

  constructor() { this.cargar(); }

  cargar() {
    this.api.listar(this.desde(), this.hasta(), this.categoriaFiltro()).subscribe({
      next: (d) => this.gastos.set(d),
      error: () => this.snack.open('No se pudo conectar con Flask :5000', 'OK', { duration: 3000 }),
    });
    this.api.resumen(this.desde(), this.hasta()).subscribe({ next: (r) => this.resumen.set(r) });
  }

  guardar() {
    if (!this.concepto().trim() || !this.monto() || this.monto()! <= 0) {
      this.snack.open('Completa concepto y monto mayor a 0', 'OK', { duration: 2500 });
      return;
    }
    this.guardando.set(true);
    const payload: any = {
      concepto: this.concepto().trim(),
      categoria: this.categoria(),
      monto: Number(this.monto()),
      responsable: this.responsable(),
      nota: this.nota(),
    };
    if (this.fecha()) payload.fecha = this.fecha();
    const req = this.editId()
      ? this.api.actualizar(this.editId()!, payload)
      : this.api.crear(payload);
    req.subscribe({
      next: () => {
        this.guardando.set(false);
        this.snack.open('Gasto guardado ✓', 'OK', { duration: 2000 });
        this.limpiarForm();
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        const msg = e.error?.errores?.join(', ') || e.error?.error || 'Error al guardar';
        this.snack.open(msg, 'OK', { duration: 3500 });
      },
    });
  }

  editar(g: Expense) {
    this.editId.set(g.id);
    this.concepto.set(g.concepto);
    this.categoria.set(g.categoria);
    this.monto.set(g.monto);
    this.responsable.set(g.responsable || '');
    this.nota.set(g.nota || '');
    this.fecha.set((g.fecha || '').slice(0, 10));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(g: Expense) {
    if (!confirm(`¿Eliminar gasto "${g.concepto}" por ${this.fmt(g.monto)}?`)) return;
    this.api.eliminar(g.id).subscribe({
      next: () => { this.snack.open('Gasto eliminado', 'OK', { duration: 2000 }); this.cargar(); },
      error: () => this.snack.open('No se pudo eliminar', 'OK', { duration: 2500 }),
    });
  }

  limpiarForm() {
    this.editId.set(null);
    this.concepto.set('');
    this.categoria.set('insumos');
    this.monto.set(null);
    this.fecha.set('');
    this.responsable.set('');
    this.nota.set('');
  }

  limpiarFiltros() {
    this.desde.set('');
    this.hasta.set('');
    this.categoriaFiltro.set('');
    this.cargar();
  }
}
